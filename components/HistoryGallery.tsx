import React from 'react';

export interface HistoryItem {
    id: number;
    generatedImage: string;
    originalImage: string;
    age: string;
    outfit: string;
}

interface HistoryGalleryProps {
    history: HistoryItem[];
    onDelete: (id: number) => void;
    onEdit: (item: HistoryItem) => void;
    onView: (imageUrl: string) => void;
}

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onDelete, onEdit, onView }) => {
    if (history.length === 0) {
        return (
            <div className="w-full text-center py-10">
                <p className="text-indigo-300">Votre galerie est vide.</p>
                <p className="text-indigo-400 text-sm">Créez votre première photo pour la voir ici !</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-200">Votre Galerie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {history.map(item => (
                    <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-lg">
                        <img src={item.generatedImage} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                            <button onClick={() => onView(item.generatedImage)} title="Voir" className="p-2 text-white hover:text-pink-400 transition-colors"><EyeIcon /></button>
                            <button onClick={() => onEdit(item)} title="Modifier" className="p-2 text-white hover:text-purple-400 transition-colors"><PencilIcon /></button>
                            <button onClick={() => onDelete(item.id)} title="Supprimer" className="p-2 text-white hover:text-red-500 transition-colors"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};