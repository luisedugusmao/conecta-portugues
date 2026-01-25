export const ITEMS = {
    frames: [
        { id: 'frame-default', name: 'Padrão', cost: 0, description: 'Borda simples.', cssClass: 'border-2 border-slate-200' },
        { id: 'frame-gold', name: 'Ouro', cost: 150, description: 'O brilho dos campeões!', cssClass: 'border-4 border-[#eec00a] ring-2 ring-[#eec00a]/20 shadow-lg shadow-yellow-500/20' },
        { id: 'frame-neon', name: 'Neon', cost: 100, description: 'Futurista e vibrante.', cssClass: 'border-2 border-[#a51a8f] ring-2 ring-[#a51a8f] shadow-[0_0_10px_#a51a8f]' },
        { id: 'frame-fire', name: 'Fogo', cost: 200, description: 'Quente como brasa!', cssClass: 'border-4 border-orange-500 ring-2 ring-red-500 animate-pulse' },
    ],
    colors: [
        { id: 'color-default', name: 'Padrão', cost: 0, description: 'Cor clássica.', cssClass: 'text-slate-700 dark:text-slate-200' },
        { id: 'color-blue', name: 'Azul Real', cost: 50, description: 'Calma e confiança.', cssClass: 'text-blue-600 font-bold' },
        { id: 'color-red', name: 'Vermelho', cost: 50, description: 'Poder e energia.', cssClass: 'text-red-500 font-bold' },
        { id: 'color-green', name: 'Esmeralda', cost: 75, description: 'Natureza e crescimento.', cssClass: 'text-emerald-600 font-bold' },
        { id: 'color-purple', name: 'Roxo Místico', cost: 75, description: 'Mistério e magia.', cssClass: 'text-purple-600 font-bold' },
    ]
};

export const getFrameClass = (id) => ITEMS.frames.find(i => i.id === id)?.cssClass || ITEMS.frames[0].cssClass;
export const getColorClass = (id) => ITEMS.colors.find(i => i.id === id)?.cssClass || ITEMS.colors[0].cssClass;
