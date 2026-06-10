export interface ProductModel {
    id: string;
    title: string;
    aliases?: string[];
    technicalDossier?: string;
}

export interface ProductFamily {
    familyTitle: string;
    category: string;
    brand: string;
    aliases: string[];
    sharedHighlights?: string[];
    models: ProductModel[];
}

export const PRODUCT_FAMILIES: ProductFamily[] = [
    {
        familyTitle: 'Conectores de Campo',
        category: 'Conectores e Acessórios',
        brand: 'Greatek',
        aliases: [
            'conectores',
            'conectores de campo',
            'conector de campo',
            'c03',
            'c04',
            'rosca'
        ],
        sharedHighlights: [
            'Homologados pela Anatel',
            'Baixa perda de inserção',
            'Fácil montagem em campo'
        ],
        models: [
            {
                id: 'con-rosca',
                title: 'Conector de Rosca',
                aliases: ['rosca']
            },
            {
                id: 'con-c04',
                title: 'Conector C04',
                aliases: ['c04', 'click']
            },
            {
                id: 'con-c03',
                title: 'Conector C03',
                aliases: ['c03']
            }
        ]
    }
];
