import React from 'react';

const StorySection = () => {
    return (
        <section className="relative py-24 px-6 bg-[#0a0a0a] text-white border-t border-white/5">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-amber-500 tracking-wide uppercase">Moja Misja</h2>
                    <div className="h-1 w-20 bg-amber-500 mx-auto" />
                </div>

                <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-300 font-serif">
                    <p>
                        <span className="text-4xl float-left mr-2 font-bold text-amber-600">M</span>
                        am głos, który zdarza się raz na milion. Nie mówię tego z pychy, ale z odpowiedzialności.
                        To dar, który wymaga pielęgnacji i powrotu do korzeni.
                    </p>
                    <p>
                        Wyruszasz w podróż do Gabonu, by połączyć ten dar z pierwotną tradycją Bwiti.
                        To nie jest zwykła wycieczka. To misja odnalezienia dźwięków, które zostały zapomniane przez cywilizację.
                    </p>
                    <p>
                        Zostań moim mecenasem. Twoje wsparcie nie tylko finansuje tę wyprawę, ale czyni Cię jej częścią.
                        W zamian otwieram przed Tobą mój Skarbiec – pełny, ekskluzywny występ, jakiego świat jeszcze nie widział.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StorySection;
