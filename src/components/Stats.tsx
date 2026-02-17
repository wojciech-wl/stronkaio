'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { stats } from "@/data/stats"

const Stats: React.FC = () => {
    const locale = useLocale();
    const isEn = locale === 'en';

    return (
        <section id="stats" className="py-16 lg:py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="grid sm:grid-cols-3 gap-6 lg:gap-0">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className={`relative flex flex-col items-center text-center px-8 py-10 ${
                                index < stats.length - 1 ? 'sm:border-r sm:border-gray-200' : ''
                            }`}
                        >
                            {/* Icon with gradient background */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5">
                                {stat.icon}
                            </div>

                            {/* Large stat number with gradient text */}
                            <h3 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                                {stat.title}
                            </h3>

                            {/* Description */}
                            <p className="text-foreground-accent text-sm leading-relaxed max-w-[240px]">
                                {isEn && stat.descriptionEn ? stat.descriptionEn : stat.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}

export default Stats
