"use client";

import { FiHeart, FiUsers, FiShield, FiGift } from "react-icons/fi";
import { motion } from "framer-motion";
import { useLocale } from 'next-intl';

const missionPoints = {
    pl: [
        {
            icon: <FiHeart size={32} strokeWidth={1.5} />,
            title: "Pro bono",
            description: "Aplikacja powstała z potrzeby pomocy. Twórca sam zmaga się z insulinoopornością i wie, jak trudno znaleźć rzetelne informacje."
        },
        {
            icon: <FiUsers size={32} strokeWidth={1.5} />,
            title: "Społeczność",
            description: "Budujemy społeczność osób z IO. Razem łatwiej - dzielimy się wiedzą i wspieramy się nawzajem."
        },
        {
            icon: <FiShield size={32} strokeWidth={1.5} />,
            title: "Prywatność",
            description: "Nie zbieramy danych. Nie profilujemy. Nie sprzedajemy. Twoje zdrowie to Twoja sprawa."
        },
        {
            icon: <FiGift size={32} strokeWidth={1.5} />,
            title: "Zawsze za darmo",
            description: "Podstawowe funkcje aplikacji zawsze będą darmowe. Bez reklam, bez ukrytych kosztów."
        }
    ],
    en: [
        {
            icon: <FiHeart size={32} strokeWidth={1.5} />,
            title: "Pro Bono",
            description: "The app was created out of a need to help. The creator himself struggles with insulin resistance and knows how hard it is to find reliable information."
        },
        {
            icon: <FiUsers size={32} strokeWidth={1.5} />,
            title: "Community",
            description: "We're building a community of people with IR. Together it's easier - we share knowledge and support each other."
        },
        {
            icon: <FiShield size={32} strokeWidth={1.5} />,
            title: "Privacy",
            description: "We don't collect data. We don't profile. We don't sell. Your health is your business."
        },
        {
            icon: <FiGift size={32} strokeWidth={1.5} />,
            title: "Always Free",
            description: "Basic app features will always be free. No ads, no hidden costs."
        }
    ]
};

const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.03, y: -6, transition: { duration: 0.3, ease: "easeOut" } },
};

const Mission: React.FC = () => {
    const locale = useLocale();
    const isEn = locale === 'en';
    const points = isEn ? missionPoints.en : missionPoints.pl;

    return (
        <section id="mission" className="relative py-24 overflow-hidden">
            {/* Background with subtle grid pattern matching Hero */}
            <div className="absolute inset-0 -z-10 bg-hero-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#2E7D5208_1px,transparent_1px),linear-gradient(to_bottom,#2E7D5208_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(76,175,80,0.08),transparent)]" />
            </div>

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        {isEn ? 'Our Mission' : 'Nasza Misja'}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
                        {isEn ? 'Why We Do This' : 'Dlaczego to robimy'}
                    </h2>
                    <p className="text-foreground-accent text-lg max-w-2xl mx-auto leading-relaxed">
                        {isEn
                            ? 'We believe everyone deserves access to tools supporting their health. Regardless of financial situation.'
                            : 'Wierzymy, że każdy zasługuje na dostęp do narzędzi wspierających zdrowie. Bez względu na sytuację finansową.'
                        }
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                    {points.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            variants={cardVariants}
                            whileHover="hover"
                            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-7 text-center border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(46,125,82,0.1)] transition-shadow duration-300 cursor-default"
                        >
                            {/* Gradient top accent */}
                            <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-5 text-primary group-hover:from-primary/15 group-hover:to-secondary/15 transition-colors duration-300">
                                {point.icon}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2.5">
                                {point.title}
                            </h3>
                            <p className="text-foreground-accent text-sm leading-relaxed">
                                {point.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Mission;
