import './globals.css';

export const metadata = {
    title: 'Vedanta FleetPulse — GPS Vehicle Tracking',
    description: 'Real-time GPS vehicle tracking dashboard with live location, vehicle status monitoring, and estimated wait times. Powered by Supabase.',
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0c1a3a',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="FleetPulse" />
                <link rel="apple-touch-icon" href="/favicon.png" />
            </head>
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
