'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ctaDetails } from "@/data/cta"

import PlayStoreButton from "./PlayStoreButton"

const CTA: React.FC = () => {
    const locale = useLocale();
    const isEn = locale === 'en';

    return (
        <section id="cta" className="mt-10 mb-5 lg:my-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-full w-full z-10 mx-auto py-12 sm:py-20"
            >
                <div className="h-full w-full">
                    <div className="rounded-3xl opacity-95 absolute inset-0 -z-10 h-full w-full bg-primary bg-[linear-gradient(to_right,#1B5E3A_1px,transparent_1px),linear-gradient(to_bottom,#1B5E3A_1px,transparent_1px)] bg-[size:6rem_4rem]">
                        <div className="rounded-3xl absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_600px_at_50%_500px,#4CAF50,transparent)]"></div>
                    </div>

                    <div className="h-full flex flex-col items-center justify-center text-white text-center px-5">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold mb-4 max-w-2xl">
                            {isEn ? ctaDetails.headingEn : ctaDetails.heading}
                        </h2>

                        <p className="mx-auto max-w-xl md:px-5">
                            {isEn ? ctaDetails.subheadingEn : ctaDetails.subheading}
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row items-center sm:gap-4">
                            <PlayStoreButton />
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default CTA
