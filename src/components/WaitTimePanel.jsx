import React from 'react';
import { Clock, User, MapPin, ArrowRight } from 'lucide-react';
import { getWaitTime } from '../hooks/useSupabaseData';

export default function WaitTimePanel({ assignments, vehicles }) {
    const [tick, setTick] = React.useState(0);
    React.useEffect(() => {
        setTick(1); // Force initial client render to match hydrating string or just to trigger client time
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    // Only show in-use vehicles with assignments
    const activeAssignments = assignments
        .map(a => {
            const vehicle = vehicles.find(v => v.id === a.vehicle_id);
            return { ...a, vehicle };
        })
        .filter(a => a.vehicle && a.vehicle.status === 'in_use')
        .sort((a, b) => {
            if (!a.estimated_end) return 1;
            if (!b.estimated_end) return -1;
            return new Date(a.estimated_end) - new Date(b.estimated_end);
        });

    if (activeAssignments.length === 0) {
        return (
            <div className="wait-panel" id="wait-time-panel">
                <div className="wait-panel-header">
                    <Clock size={18} />
                    <h3>Estimated Wait Times</h3>
                </div>
                <div className="wait-panel-empty">
                    <p>All vehicles are currently available!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wait-panel" id="wait-time-panel">
            <div className="wait-panel-header">
                <Clock size={18} />
                <h3>Estimated Wait Times</h3>
            </div>
            <div className="wait-panel-body">
                {activeAssignments.map((a) => {
                    const waitTime = getWaitTime(a.estimated_end);
                    const isDueSoon = waitTime === 'Due now' || (waitTime.includes('m') && !waitTime.includes('h') && parseInt(waitTime) < 30);

                    return (
                        <div
                            key={a.id}
                            className={`wait-item ${isDueSoon ? 'due-soon' : ''}`}
                            id={`wait-item-${a.id}`}
                        >
                            <div className="wait-item-vehicle">
                                <span className="wait-vehicle-name">{a.vehicle?.name}</span>
                                <span className="wait-vehicle-plate">{a.vehicle?.plate_number}</span>
                            </div>
                            <div className="wait-item-details">
                                <div className="wait-detail-row">
                                    <User size={13} />
                                    <span>{a.assigned_to}</span>
                                </div>
                                {a.purpose && (
                                    <div className="wait-detail-row">
                                        <MapPin size={13} />
                                        <span>{a.purpose}</span>
                                    </div>
                                )}
                            </div>
                            <div className="wait-item-time">
                                <span
                                    className={`wait-time-value ${isDueSoon ? 'pulse' : ''}`}
                                    suppressHydrationWarning
                                >
                                    {waitTime}
                                </span>
                                <span className="wait-time-label">est. return</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
