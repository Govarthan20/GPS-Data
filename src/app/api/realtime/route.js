import { query } from '../../../lib/db';
import pg from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events (SSE) Route for Realtime GPS Updates
 * Listens to Postgres NOTIFY events and streams them to the client.
 */
export async function GET(request) {
    const encoder = new TextEncoder();

    // Create a new direct client for the LISTEN connection
    // Note: Pooled connections are not ideal for LISTEN since it ties up a connection indefinitely.
    const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('LISTEN gps_updates');

        const stream = new ReadableStream({
            async start(controller) {
                // Heartbeat to keep connection alive
                const heartbeat = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(': heartbeat\n\n'));
                    } catch (e) {
                        clearInterval(heartbeat);
                    }
                }, 15000);

                // Listener for Postgres notifications
                client.on('notification', async (msg) => {
                    if (msg.channel === 'gps_updates' && msg.payload) {
                        try {
                            const data = JSON.parse(msg.payload);
                            const chunk = `data: ${JSON.stringify(data)}\n\n`;
                            controller.enqueue(encoder.encode(chunk));
                        } catch (err) {
                            console.error('Error parsing notification payload:', err);
                        }
                    }
                });

                // Clean up on stream closure
                request.signal.addEventListener('abort', async () => {
                    clearInterval(heartbeat);
                    client.removeAllListeners('notification');
                    await client.query('UNLISTEN gps_updates');
                    await client.end();
                    controller.close();
                });
            },
            cancel() {
                client.end();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Realtime Connection Error:', error);
        await client.end();
        return NextResponse.json({ error: 'Failed to establish realtime connection' }, { status: 500 });
    }
}
