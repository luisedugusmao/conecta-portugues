import { collection, doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

const firstNames = ["Pedro", "Maria", "Lucas", "Julia", "Gabriel", "Sofia", "Mateus", "Alice", "Enzo", "Laura", "Rafael", "Clara", "Gustavo", "Isabela", "Felipe"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida"];
const avatars = ['👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '🦄', '🐲', '🧙‍♂️', '🧝‍♀️', '🦸‍♂️'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const addRandomStudents = async (count = 5) => {
    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');

    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const fullName = `${firstName} ${lastName}`;
        // Unique ID generation
        const id = `st_rand_${Date.now()}_${i}`;
        const xp = Math.floor(Math.random() * 5000);
        const userCode = (firstName.slice(0, 3) + Math.floor(Math.random() * 10000)).toUpperCase();

        const student = {
            id: id,
            name: fullName,
            avatar: getRandomElement(avatars),
            xp: xp,
            level: Math.floor(xp / 500) + 1,
            coins: Math.floor(Math.random() * 500),
            password: '1234', // Default password
            role: 'student',
            schoolYear: `${Math.floor(Math.random() * 4) + 6}º Ano`, // 6º to 9º
            userCode: userCode,
            photoUrl: ''
        };

        try {
            await setDoc(doc(studentsRef, id), student);
            console.log(`Added student: ${fullName}`);
        } catch (error) {
            console.error("Error adding student: ", error);
        }
    }

    alert(`${count} alunos aleatórios foram adicionados com sucesso! Verifique o Ranking.`);
};
