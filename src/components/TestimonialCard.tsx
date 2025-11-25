
import React from 'react';
import { Testimonial } from '../types.ts';

interface TestimonialCardProps {
    testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg transform hover:-translate-y-2 transition-transform duration-300 text-left">
            <blockquote className="text-gray-300 italic">
                “{testimonial.quote}”
            </blockquote>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-sm text-purple-400">{testimonial.role}</p>
            </div>
        </div>
    );
};

export default TestimonialCard;
