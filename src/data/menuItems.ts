export interface IMenuItemWithEn {
    text: string;
    textEn?: string;
    url: string;
}

export const menuItems: IMenuItemWithEn[] = [
    {
        text: "Funkcje",
        textEn: "Features",
        url: "#features"
    },
    {
        text: "Nasza Misja",
        textEn: "Our Mission",
        url: "#mission"
    },
    {
        text: "Kontakt",
        textEn: "Contact",
        url: "#contact"
    }
];
