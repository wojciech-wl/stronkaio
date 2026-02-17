import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    subheadingEn: string;
    quickLinks: IMenuItem[];
    quickLinksEn: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "Darmowy asystent dla osób z insulinoopornością. Pro bono, bez reklam, z szacunkiem do prywatności.",
    subheadingEn: "Free assistant for people with insulin resistance. Pro bono, no ads, with respect for privacy.",
    quickLinks: [
        {
            text: "Funkcje",
            url: "#features"
        },
        {
            text: "Nasza Misja",
            url: "#mission"
        },
        {
            text: "Kontakt",
            url: "#contact"
        },
        {
            text: "Polityka Prywatności",
            url: "https://asystentioapp-spec.github.io/asystentio-legal/"
        }
    ],
    quickLinksEn: [
        {
            text: "Features",
            url: "#features"
        },
        {
            text: "Our Mission",
            url: "#mission"
        },
        {
            text: "Contact",
            url: "#contact"
        },
        {
            text: "Privacy Policy",
            url: "https://asystentioapp-spec.github.io/asystentio-legal/"
        }
    ],
    email: 'asystent.io.app@gmail.com',
    telephone: '',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        // twitter: 'https://twitter.com/Twitter',
        // facebook: 'https://facebook.com',
        // youtube: 'https://youtube.com',
        // linkedin: 'https://www.linkedin.com',
        // threads: 'https://www.threads.net',
        // instagram: 'https://www.instagram.com',
    }
}
