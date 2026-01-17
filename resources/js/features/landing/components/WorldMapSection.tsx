import { NumberTicker } from '@/components/ui/number-ticker';
import WorldMap from '@/components/ui/world-map';
import { worldMapDots } from '../constants/worldMapDots';

export function WorldMapSection() {
    return (
        <section className="bg-white px-6 py-16 sm:py-20">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-12 space-y-4 text-center">
                    <h2 className="text-3xl leading-tight font-bold text-slate-900 md:text-4xl md:leading-tight">
                        Dipercaya Bisnis di
                        <span
                            className="mt-2 block"
                            style={{ color: '#2547F9' }}
                        >
                            Seluruh Indonesia
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
                        Ribuan bisnis dari berbagai kota telah mempercayai
                        ChatCepat untuk meningkatkan customer experience mereka
                    </p>
                </div>

                <div className="relative">
                    <WorldMap dots={worldMapDots} lineColor="#2547F9" />
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="text-center">
                        <div
                            className="mb-2 text-4xl font-bold"
                            style={{ color: '#2547F9' }}
                        >
                            <NumberTicker
                                value={50}
                                style={{ color: '#2547F9' }}
                            />
                            +
                        </div>
                        <div className="text-sm text-slate-600">
                            Kota di Indonesia
                        </div>
                    </div>
                    <div className="text-center">
                        <div
                            className="mb-2 text-4xl font-bold"
                            style={{ color: '#2547F9' }}
                        >
                            <NumberTicker
                                value={5000}
                                style={{ color: '#2547F9' }}
                            />
                            +
                        </div>
                        <div className="text-sm text-slate-600">
                            Bisnis Terdaftar
                        </div>
                    </div>
                    <div className="text-center">
                        <div
                            className="mb-2 text-4xl font-bold"
                            style={{ color: '#2547F9' }}
                        >
                            <NumberTicker
                                value={1}
                                style={{ color: '#2547F9' }}
                            />
                            M+
                        </div>
                        <div className="text-sm text-slate-600">
                            Chat Terkirim
                        </div>
                    </div>
                    <div className="text-center">
                        <div
                            className="mb-2 text-4xl font-bold"
                            style={{ color: '#2547F9' }}
                        >
                            <NumberTicker
                                value={98}
                                style={{ color: '#2547F9' }}
                            />
                            %
                        </div>
                        <div className="text-sm text-slate-600">
                            Kepuasan Customer
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
