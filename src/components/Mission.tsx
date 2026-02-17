"use client";

import { FiHeart, FiUsers, FiShield, FiGift } from "react-icons/fi";
import { motion } from "framer-motion";

const missionPoints = [
    {
        icon: <FiHeart size={32} />,
        title: "Pro bono",
        description: "Aplikacja powstała z potrzeby pomocy. Twórca sam zmaga się z insulinoopornością i wie, jak trudno znaleźć rzetelne informacje."
    },
    {
        icon: <FiUsers size={32} />,
        title: "Społeczność",
        description: "Budujemy społeczność osób z IO. Razem łatwiej - dzielimy się wiedzą, doświadczeniami i wspieramy się nawzajem."
    },
    {
        icon: <FiShield size={32} />,
        title: "Prywatność",
        description: "Nie zbieramy danych. Nie profilujemy. Nie sprzedajemy. Twoje zdrowie to Twoja sprawa - my tylko pomagamy."
    },
    {
        icon: <FiGift size={32} />,
        title: "Zawsze za darmo",
        description: "Podstawowe funkcje aplikacji zawsze będą darmowe. Bez reklam, bez ukrytych kosztów, bez ograniczeń czasowych."
    }
];

const Mission: React.FC = () => {
    return (
        <section id="mission" className="py-16 lg:py-24 bg-hero-background">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Nasza Misja
                    </h2>
                    <p className="text-foreground-accent text-lg max-w-2xl mx-auto">
                        Wierzymy, że każdy zasługuje na dostęp do narzędzi wspierających zdrowie.
                        Bez względu na sytuację finansową.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {missionPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="text-primary mb-4">
                                {point.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {point.title}
                            </h3>
                            <p className="text-foreground-accent">
                                {point.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <div className="bg-primary/10 rounded-2xl p-8 max-w-3xl mx-auto">
                        <p className="text-lg text-foreground italic">
                            &ldquo;Insulinooporność dotyka miliony ludzi. Chcemy, żeby każdy miał dostęp
                            do narzędzia, które pomoże podejmować świadome decyzje żywieniowe.
                            Nie musisz być ekspertem - wystarczy, że skanujesz produkt.&rdquo;
                        </p>
                        <p className="mt-4 text-foreground-accent font-medium">
                            — Wojciech Włodek, Twórca Asystent IO
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Mission;
