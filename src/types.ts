export interface IMenuItem {
    text: string;
    url: string;
}

export interface IBenefit {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    imageSrc: string;
    bullets: IBenefitBullet[]
}

export interface IBenefitBullet {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    icon: JSX.Element;
}

export interface IPricing {
    name: string;
    price: number | string;
    features: string[];
}

export interface IFAQ {
    question: string;
    answer: string;
}

export interface ITestimonial {
    name: string;
    role: string;
    message: string;
    avatar: string;
}

export interface IStats {
    title: string;
    icon: JSX.Element;
    description: string;
    descriptionEn?: string;
}

export interface ISocials {
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    threads?: string;
    twitter?: string;
    youtube?: string;
    x?: string;
    [key: string]: string | undefined;
}
