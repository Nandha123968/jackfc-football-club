import React, { useState } from 'react';
import { faqsData, testimonialsData } from '../data';
import { Star, ChevronDown, Award, HelpCircle } from 'lucide-react';

export default function FAQAndReviews() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  return (
    <section id="testimonials" className="py-24 bg-white text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials Segment */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-orange-600 font-mono tracking-widest uppercase mb-3 block">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-zinc-950 uppercase tracking-tight">
              ATHLETES <span className="text-orange-600">VERDICT</span>
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base font-medium mt-3">
              Stories from our regular club members, tournament pros, and local families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((review) => (
              <div
                key={review.id}
                className="bg-zinc-50 p-6 sm:p-8 rounded-2xl border border-zinc-150 relative shadow-sm scale-card"
              >
                {/* Five star rating component */}
                <div className="flex gap-1 text-orange-500 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current" />
                  ))}
                </div>

                <p className="text-zinc-600 text-sm sm:text-base font-medium italic leading-relaxed mb-6">
                  "{review.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                  <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    {review.avatar}
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-zinc-900 capitalize leading-none">
                      {review.name}
                    </h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Segment from referenced Varanasi screenshots */}
        <div className="bg-zinc-50 rounded-3xl p-6 sm:p-12 border border-zinc-200 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-4 flex flex-col justify-center h-full">
              <span className="text-xs font-extrabold text-orange-600 font-mono tracking-widest uppercase mb-1.5 block">
                Technical Help
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-zinc-950 uppercase leading-none tracking-tight mb-4">
                COMMON <span className="text-orange-600">QUESTIONS</span>
              </h3>
              <p className="text-zinc-500 text-sm sm:text-base font-medium leading-relaxed mb-6">
                Everything you need to know about play rules, footwear compliance, membership priorities, and cancel credit options at Jack Football Club.
              </p>
              
              <div className="hidden lg:block">
                <HelpCircle className="w-16 h-16 text-zinc-200" />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {faqsData.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-zinc-150 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left py-4.5 px-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50"
                    >
                      <span className="text-sm sm:text-base font-bold text-zinc-900 pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-orange-600 transform transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-zinc-100 text-xs sm:text-sm text-zinc-650 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
