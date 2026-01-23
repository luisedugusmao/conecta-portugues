import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  increment,
  arrayUnion,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  BookOpen,
  Trophy,
  Home,
  Gamepad2,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  Lock,
  LogOut,
  X,
  Star,
  PlayCircle,
  Clock,
  Radio,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Plus,
  DollarSign,
  Settings,
  Trash2,
  Save,
  UserPlus,
  User,
  Edit,
  Filter,
  Copy,
  PlusCircle,
  Type,
  AlignLeft,
  CheckSquare,
  Check,
  Paperclip,
  Link as LinkIcon,
  ShieldAlert,
  Hash,
  MessageSquare,
  FileCheck,
  Search
} from 'lucide-react';
import { BackgroundPaths } from './components/BackgroundPaths';
import { ThemeToggle } from './components/ThemeToggle';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { createTamagui, TamaguiProvider, View } from 'tamagui'
import { config as defaultConfig } from '@tamagui/config/v3'

const config = createTamagui(defaultConfig)

// --- CONFIGURAÃ‡ÃƒO FIREBASE ---
// IMPORTANTE: Substitua JSON.parse(__firebase_config) pelas suas credenciais reais ao usar localmente.
// Exemplo:
// const firebaseConfig = {
//   apiKey: "SUA_API_KEY",
//   authDomain: "seu-projeto.firebaseapp.com",
//   ...
// };
// --- CONFIGURAÃ‡ÃƒO FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'conecta-portugues-v1';

// --- COMPONENTE LOGO SVG ---
const LogoSVG = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="Camada_2"
    data-name="Camada 2"
    viewBox="0 0 1373.75 371.2"
    className={className}
    role="img"
    aria-label="Conecta PortuguÃªs Logo"
  >

    <g id="Camada_1-2" data-name="Camada 1">
      <g>
        <g>
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M382.08,0c14.52-.06,27.88,4.81,40.07,14.61,9.57,7.7,14.35,15.66,14.35,23.89,0,7-2.92,12.42-8.75,16.27-3.32,2.22-6.94,3.32-10.85,3.32-3.21,0-6.27-.76-9.19-2.27-1.22-.64-4.26-3.59-9.1-8.84-4.49-4.9-10.12-7.35-16.89-7.35s-12,2.26-16.41,6.78c-4.4,4.52-6.61,10.05-6.61,16.58s2.2,11.97,6.61,16.49c4.4,4.52,9.84,6.78,16.32,6.78,5.37,0,10.35-1.81,14.96-5.42,2.86-2.74,5.69-5.48,8.49-8.22,3.03-2.62,6.88-3.94,11.55-3.94,5.37,0,10.02,1.88,13.96,5.64,3.94,3.76,5.91,8.33,5.91,13.69,0,7.29-4.29,14.67-12.86,22.14-12.02,10.5-25.9,15.75-41.65,15.75-9.74,0-18.93-2.07-27.56-6.21-10.91-5.25-19.58-12.96-26.03-23.14-6.45-10.18-9.67-21.3-9.67-33.38,0-18.08,6.71-33.48,20.12-46.2C350.7,5.78,365.11.12,382.08,0Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M505.36,0c12.13-.12,23.27,3.05,33.42,9.49,10.15,6.45,17.85,14.95,23.1,25.5,4.37,8.75,6.56,18.02,6.56,27.82,0,11.02-2.71,21.35-8.14,30.97-5.42,9.62-12.83,17.29-22.22,23.01-9.97,6.07-21,9.1-33.07,9.1s-22.68-3.17-32.85-9.49c-10.18-6.33-17.86-14.77-23.05-25.33-4.38-8.87-6.56-18.61-6.56-29.22,0-8.75,1.89-17.21,5.69-25.37,5.19-11.26,12.95-20.15,23.27-26.69C481.59,3.39,492.88.12,505.36,0Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M647.01,48.65v-22.22c0-6.82,1.2-12.02,3.6-15.57,3.8-5.66,9.24-8.49,16.31-8.49,6.08,0,11.08,2.36,14.99,7.09,3.1,3.73,4.65,8.95,4.65,15.66v73.23c0,8.17-1.43,14.09-4.29,17.76-3.85,4.96-8.95,7.44-15.31,7.44s-11.61-2.65-15.75-7.96l-31.41-40.07v25.11c0,6.94-1.43,12.19-4.29,15.75-3.85,4.78-8.9,7.17-15.14,7.17-6.65,0-11.9-2.57-15.75-7.7-2.8-3.73-4.2-9.33-4.2-16.8V23.54c0-6.36,1.85-11.48,5.55-15.35,3.7-3.88,8.72-5.82,15.07-5.82,5.48,0,10.34,2.6,14.59,7.79l31.37,38.5Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M742.82,85.75h17.9c7.39,0,12.89,1.52,16.5,4.55,4.25,3.62,6.37,8.28,6.37,14s-2.13,10.56-6.39,14.17c-3.32,2.8-8.78,4.2-16.36,4.2h-30.71c-7.23,0-12.19-.55-14.87-1.66-5.25-2.16-8.72-5.69-10.41-10.59-1.05-3.15-1.58-8.31-1.58-15.49V30.01c0-5.42.17-9.07.53-10.94.64-3.79,2.19-7,4.64-9.62,2.8-2.97,6.36-4.87,10.67-5.69,2.04-.35,6.18-.52,12.42-.52h23.54c6.42,0,10.15.06,11.2.17,4.2.41,7.64,1.63,10.32,3.67,4.78,3.62,7.17,8.34,7.17,14.17,0,6.3-2.1,11.11-6.29,14.44-3.73,2.97-8.82,4.46-15.28,4.46h-19.38v8.14h15.44c4.54,0,8.29,1.2,11.25,3.59,3.14,2.57,4.71,6.1,4.71,10.59,0,9.51-5.79,14.26-17.36,14.26h-14.05v9.01Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M853.85,0c14.52-.06,27.88,4.81,40.07,14.61,9.57,7.7,14.35,15.66,14.35,23.89,0,7-2.92,12.42-8.75,16.27-3.32,2.22-6.94,3.32-10.85,3.32-3.21,0-6.27-.76-9.19-2.27-1.23-.64-4.26-3.59-9.1-8.84-4.49-4.9-10.12-7.35-16.89-7.35s-12,2.26-16.4,6.78c-4.41,4.52-6.61,10.05-6.61,16.58s2.2,11.97,6.61,16.49c4.4,4.52,9.84,6.78,16.32,6.78,5.37,0,10.35-1.81,14.96-5.42,2.86-2.74,5.69-5.48,8.49-8.22,3.03-2.62,6.88-3.94,11.55-3.94,5.37,0,10.02,1.88,13.96,5.64s5.91,8.33,5.91,13.69c0,7.29-4.29,14.67-12.86,22.14-12.02,10.5-25.9,15.75-41.65,15.75-9.74,0-18.93-2.07-27.56-6.21-10.91-5.25-19.58-12.96-26.03-23.14-6.45-10.18-9.67-21.3-9.67-33.38,0-18.08,6.71-33.48,20.12-46.2C822.47,5.78,836.87.12,853.85,0Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M940.29,39.9h-10.41c-5.77,0-10.56-1.58-14.35-4.72-4.03-3.38-6.04-7.9-6.04-13.56,0-3.38.95-6.63,2.84-9.76,1.9-3.12,4.34-5.34,7.35-6.65,3-1.31,10.13-1.97,21.39-1.97h39.72c9.74,0,16.04.58,18.9,1.75,3.15,1.28,5.7,3.49,7.66,6.61,1.95,3.12,2.93,6.4,2.93,9.84,0,5.42-2.16,10.15-6.47,14.17-3.09,2.86-8.14,4.29-15.14,4.29h-9.01v59.5c0,6.47-1.11,11.49-3.32,15.05-3.73,5.95-9.13,8.92-16.19,8.92s-12.48-2.71-16.27-8.14c-2.39-3.38-3.59-8.52-3.59-15.4v-59.93Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M1039.51,107.18c-1.87,4.43-3.79,7.73-5.77,9.89-3.97,4.32-8.78,6.47-14.44,6.47-6.94,0-12.34-2.8-16.19-8.4-2.27-3.32-3.41-7.06-3.41-11.2,0-3.44.82-6.91,2.45-10.41l37.36-79.53c3.62-7.76,9.65-11.64,18.11-11.64s14.73,4,18.46,11.99l37.71,80.14c1.52,3.21,2.27,6.39,2.27,9.54,0,4.67-1.52,8.81-4.55,12.42-3.97,4.72-9.04,7.09-15.22,7.09-5.07,0-9.3-1.57-12.69-4.72-2.51-2.33-5.02-6.21-7.52-11.64h-36.57Z" />
        </g>
        <g>
          <path className="fill-[#eec00a] transition-colors" d="M381.35,243.9v12.47c0,6.94-1.72,12.62-5.16,17.06-3.75,4.87-9,7.31-15.75,7.31-7.69,0-13.56-3.22-17.62-9.66-1.87-2.94-3-6.15-3.37-9.66-.19-1.44-.28-4.94-.28-10.5v-74.71c0-8.06,1.94-14.06,5.81-18,4.19-4.25,9.9-6.37,17.15-6.37h17.81c11.31,0,19.53.78,24.65,2.34,9.69,2.94,17.51,8.44,23.48,16.5,5.97,8.06,8.95,17.15,8.95,27.28,0,9.5-2.72,18.19-8.16,26.06-9.19,13.25-22.59,19.87-40.21,19.87h-7.31Z" />
          <path className="fill-[#eec00a] transition-colors" d="M510.71,148.38c13-.12,24.93,3.27,35.81,10.17,10.87,6.91,19.12,16.01,24.75,27.32,4.69,9.37,7.03,19.31,7.03,29.81,0,11.81-2.91,22.87-8.72,33.18s-13.75,18.53-23.81,24.65c-10.69,6.5-22.5,9.75-35.43,9.75s-24.29-3.39-35.2-10.17c-10.91-6.78-19.14-15.83-24.7-27.14-4.69-9.5-7.03-19.93-7.03-31.31,0-9.37,2.03-18.43,6.09-27.18,5.56-12.06,13.87-21.59,24.93-28.59,10.81-6.87,22.9-10.37,36.28-10.5Z" />
          <path className="fill-[#eec00a] transition-colors" d="M675.41,230.5l9.94,15.93c2.75,4.44,4.12,9,4.12,13.69,0,5.94-2.05,10.86-6.14,14.76-4.09,3.91-9.11,5.86-15.04,5.86-7.62,0-13.4-3.25-17.34-9.75l-17.62-28.87v17.34c0,5.94-1.95,10.97-5.86,15.09-3.91,4.12-8.83,6.19-14.76,6.19-7.25,0-12.75-2.59-16.5-7.78-3.37-4.56-5.06-10.56-5.06-18v-78.83c0-16.18,8.72-24.28,26.15-24.28h26.81c8.81,0,17,2.55,24.56,7.64,7.56,5.09,13.09,11.7,16.59,19.83,2.62,6.12,3.94,12.28,3.94,18.47,0,11.56-4.59,22.47-13.78,32.71Z" />
          <path className="fill-[#eec00a] transition-colors" d="M725.56,191.13h-11.15c-6.19,0-11.31-1.69-15.37-5.06-4.31-3.62-6.47-8.47-6.47-14.53,0-3.62,1.02-7.11,3.05-10.45,2.03-3.34,4.65-5.72,7.87-7.12,3.22-1.41,10.86-2.11,22.92-2.11h42.56c10.44,0,17.18.62,20.25,1.87,3.38,1.38,6.11,3.73,8.2,7.08,2.09,3.34,3.14,6.86,3.14,10.55,0,5.81-2.31,10.87-6.94,15.19-3.31,3.06-8.72,4.59-16.22,4.59h-9.66v63.74c0,6.94-1.19,12.31-3.56,16.12-4,6.37-9.78,9.56-17.34,9.56s-13.37-2.91-17.43-8.72c-2.56-3.62-3.84-9.12-3.84-16.5v-64.21Z" />
          <path className="fill-[#eec00a] transition-colors" d="M849.1,175.85v50.34c0,9.75,3.9,14.62,11.72,14.62s11.72-4.69,11.72-14.06v-50.99c0-4.69.12-7.72.37-9.09.5-2.63,1.84-5.25,4.03-7.87,4.25-5.25,9.69-7.87,16.31-7.87s12.19,2.56,16.5,7.69c3.31,3.94,4.97,10.72,4.97,20.34v45.18c0,16.75-4.44,30.18-13.31,40.31-11.06,12.56-24.59,18.84-40.59,18.84-9.81,0-19.06-2.62-27.75-7.87-11.06-6.69-18.78-16.25-23.15-28.68-2-5.69-3-13.22-3-22.59v-45.18c0-5.25.12-8.72.38-10.41.56-3.5,1.94-6.62,4.12-9.37,4.31-5.5,9.87-8.25,16.69-8.25,6.06,0,11.22,2.22,15.47,6.66,3.69,3.81,5.53,9.91,5.53,18.28Z" />
          <path className="fill-[#eec00a] transition-colors" d="M1008.27,236.03h-6.09c-7.81,0-13.12-2.5-15.94-7.5-1.38-2.37-2.06-5-2.06-7.87,0-5.12,2-9.12,6-12,3-2.19,7.81-3.28,14.44-3.28,10.56,0,16.68.06,18.37.19,8.12.56,13.75,2.16,16.87,4.78,4.75,4,7.12,10.78,7.12,20.34,0,7.31-.16,13.69-.47,19.12-.44,7.87-5.34,15.03-14.72,21.47-11.62,8-24.25,12-37.87,12-16.37,0-30.81-5.19-43.31-15.56-7.62-6.37-13.59-14.14-17.9-23.29-4.31-9.15-6.47-18.7-6.47-28.64,0-12.87,3.38-24.76,10.12-35.67,6.75-10.9,15.87-19.14,27.37-24.7,9.69-4.69,19.68-7.03,30-7.03,13,0,25,3.47,36,10.4,8.81,5.56,13.22,12.22,13.22,19.97,0,5.88-2.09,10.89-6.28,15.04-4.19,4.16-9.22,6.23-15.09,6.23-2.44,0-7.5-1.91-15.19-5.72-4.62-2.31-9.06-3.47-13.31-3.47-6.62,0-12.28,2.48-16.97,7.45-4.69,4.97-7.03,10.8-7.03,17.48s2.39,12.83,7.17,17.67c4.78,4.84,10.64,7.26,17.58,7.26,4.44,0,9.25-1.56,14.44-4.69Z" />
          <path className="fill-[#eec00a] transition-colors" d="M1100.6,175.85v50.34c0,9.75,3.91,14.62,11.72,14.62s11.72-4.69,11.72-14.06v-50.99c0-4.69.12-7.72.38-9.09.5-2.63,1.84-5.25,4.03-7.87,4.25-5.25,9.69-7.87,16.31-7.87s12.19,2.56,16.5,7.69c3.31,3.94,4.97,10.72,4.97,20.34v45.18c0,16.75-4.44,30.18-13.31,40.31-11.06,12.56-24.59,18.84-40.59,18.84-9.81,0-19.06-2.62-27.75-7.87-11.06-6.69-18.78-16.25-23.15-28.68-2-5.69-3-13.22-3-22.59v-45.18c0-5.25.12-8.72.38-10.41.56-3.5,1.94-6.62,4.12-9.37,4.31-5.5,9.87-8.25,16.69-8.25,6.06,0,11.22,2.22,15.47,6.66,3.69,3.81,5.53,9.91,5.53,18.28Z" />
          <path className="fill-[#eec00a] transition-colors" d="M1225.27,240.24h19.17c7.92,0,13.81,1.63,17.68,4.88,4.55,3.88,6.83,8.87,6.83,15s-2.28,11.31-6.84,15.19c-3.56,3-9.41,4.5-17.53,4.5h-32.9c-7.75,0-13.06-.59-15.94-1.78-5.62-2.31-9.34-6.09-11.15-11.34-1.12-3.38-1.69-8.91-1.69-16.59v-69.55c0-5.81.19-9.72.56-11.72.69-4.06,2.34-7.5,4.97-10.31,3-3.19,6.81-5.22,11.44-6.09,2.19-.38,6.62-.56,13.31-.56h25.21c6.87,0,10.87.06,12,.19,4.5.44,8.19,1.75,11.06,3.94,5.12,3.88,7.69,8.94,7.69,15.19,0,6.75-2.25,11.9-6.73,15.47-3.99,3.19-9.45,4.78-16.37,4.78h-20.77v8.72h16.55c4.86,0,8.88,1.28,12.06,3.84,3.36,2.75,5.05,6.53,5.05,11.34,0,10.19-6.2,15.28-18.6,15.28h-15.05v9.65ZM1225.52,133.31l-6.56,5.33c-3.25,2.62-6.52,3.93-9.83,3.93-3.75,0-6.9-1.3-9.46-3.89-2.56-2.59-3.84-5.76-3.84-9.51,0-4.62,2.22-8.59,6.66-11.9l13.69-10.22c3.5-2.62,6.75-3.94,9.75-3.94,3.81,0,7.78,1.75,11.9,5.25l11.72,9.94c4.19,3.56,6.28,7.28,6.28,11.15,0,3.5-1.35,6.62-4.04,9.37-2.69,2.75-5.79,4.12-9.29,4.12-3.69,0-7.13-1.33-10.33-3.99l-6.65-5.64Z" />
          <path className="fill-[#eec00a] transition-colors" d="M1296.89,231.43c4.69,0,9.69,2.06,15,6.19,6.62,5.19,11.15,7.78,13.59,7.78,3.62,0,5.44-1.88,5.44-5.62,0-2.06-1.06-3.81-3.19-5.25-1.12-.75-7.44-3.15-18.93-7.22-18.81-6.62-28.21-18.87-28.21-36.75,0-13.5,4.97-24.15,14.9-31.96,8.69-6.81,19.43-10.22,32.25-10.22,11.06,0,20.68,2.64,28.87,7.92,8.19,5.28,12.28,12.08,12.28,20.39,0,5-1.55,9.17-4.64,12.51-3.09,3.34-7.11,5.02-12.04,5.02-5.19,0-10.94-2.47-17.25-7.41-3.94-3.06-6.91-4.59-8.9-4.59-3.44,0-5.16,1.69-5.16,5.06,0,3.19,4.25,6.09,12.75,8.72,11.75,3.69,20.84,8.19,27.28,13.5,8.56,7.12,12.84,17.12,12.84,30,0,14-4.81,24.93-14.44,32.81-8.94,7.31-20.56,10.97-34.87,10.97s-26.15-3.81-35.53-11.44c-7.5-6.06-11.25-13.15-11.25-21.28,0-5.44,1.84-9.97,5.53-13.59,3.69-3.62,8.25-5.47,13.69-5.53Z" />
        </g>
        <g>
          <path className="fill-[#eec00a] transition-colors" d="M0,26.27C2.44,12.27,13.26,1.52,27.65.44l145.09.03c14.61,1.45,26.06,12.96,27.16,27.67v123.19c-1.83,20.13-19.16,29.74-38.15,27.97-13.32,8.57-26.47,22.08-39.83,30.05-3.64,2.17-6.62,3-10.35.24-.91-.68-3.04-3.53-3.04-4.49v-26.08H26.06c-12.11,0-24.76-14.26-26.06-25.81V26.27ZM134.75,33.41c-12.98,1.42-21.71,12.91-21.62,25.69l-32.41,13.88c-1.59.16-2.39-1.61-3.71-2.51-12.1-8.28-28.76-5.79-35.85,7.5-11.95,22.37,13.02,45.6,34.88,31.68,1.5-.95,3.28-3.3,4.68-3.16l32.12,13.63c.83,3.14.76,6.4,1.75,9.54,5.68,18,30.6,22.38,41.99,7.36,16.35-21.55-8.64-49.71-32.1-35.35-1.5.92-3.91,3.73-5.33,3.59l-31.75-13.46c-1.3-.46-1.28-3.18-.37-3.94l32.12-13.63c1.42-.14,3.83,2.67,5.33,3.59,19.03,11.65,41.9-5.16,36.35-26.7-2.98-11.58-14.27-18.98-26.09-17.69Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M156.37,275.81l-43.01-31.98c-12.39.15-23.47-1.12-31.67-11.33-2.52-3.14-6.46-11.11-6.46-15.05v-22.32h17.19v11.02c0,14.9,22.02,26.86,34.92,18.81l39.79-29.55c21.21.5,40.79-12.02,46.87-32.68.59-1.99,2.01-6.96,2.01-8.75v-78.25h33.05c13.63,0,25.25,15.42,26.09,28.21,2.36,36.19-1.84,74.91,0,111.37.49,12.5-13.62,28.21-26.09,28.21h-82.48v26.08c0,2.43-3.99,5.16-5.91,6.18h-4.3Z" />
          <path className="fill-[#eec00a] transition-colors" d="M135.8,49.52c10.66-2.19,13.6,13.82,3.52,15.89-10.66,2.19-13.6-13.82-3.52-15.89Z" />
          <path className="fill-[#eec00a] transition-colors" d="M60.57,81.79c10.66-2.19,13.6,13.82,3.52,15.89-10.66,2.19-13.6-13.82-3.52-15.89Z" />
          <path className="fill-[#eec00a] transition-colors" d="M135.8,114.06c10.66-2.19,13.6,13.82,3.52,15.89-10.66,2.19-13.6-13.82-3.52-15.89Z" />
        </g>
        <g>
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M652.43,357.23l6.59-37.34c.3-1.78,1.48-2.73,3.15-2.73h10.15c9.38,0,13.83,4.33,12.41,12.29l-.48,2.67c-1.37,7.78-6.17,11.52-15.38,11.52h-8.96l-2.38,13.6c-.18.89-.89,1.48-1.78,1.48h-2.08c-.89,0-1.42-.59-1.25-1.48ZM663.83,321.31l-3.21,18.11h8.73c5.7,0,8.91-2.38,9.8-7.36l.53-3.03c.89-5.11-1.54-7.72-7.78-7.72h-8.08Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M687.35,347.43l1.37-7.9c1.25-7.18,6.12-10.98,14.01-10.98s12.47,4.39,11.16,11.93l-1.37,7.9c-1.25,7.18-6.12,10.98-14.01,10.98s-12.47-4.39-11.16-11.93ZM707.47,348.32l1.48-8.25c.89-5.05-1.31-7.54-6.71-7.54-4.87,0-7.66,2.32-8.49,7.06l-1.48,8.25c-.89,5.05,1.31,7.54,6.71,7.54,4.87,0,7.66-2.32,8.49-7.06Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M720.65,357.23l3.8-21.55-2.85-2.85c-.83-.77-.95-1.78-.12-2.61l.71-.71c.83-.83,1.84-.77,2.67.06l3.62,3.62c1.9-2.73,4.57-4.21,7.96-4.21h1.01c2.02,0,2.91.77,2.67,2.2l-.12.71c-.18,1.13-1.19,1.78-2.67,1.78h-.95c-4.28,0-7.07,2.43-7.9,7.07l-2.91,16.5c-.18.89-.83,1.48-1.72,1.48h-1.96c-.95,0-1.42-.59-1.25-1.48Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M753.66,357.23l6.83-38.59c.18-.89.83-1.48,1.72-1.48h2.14c.89,0,1.42.59,1.25,1.48l-2.91,16.51h19.42l2.91-16.51c.18-.89.83-1.48,1.72-1.48h2.14c.89,0,1.42.59,1.25,1.48l-6.83,38.59c-.18.89-.89,1.48-1.78,1.48h-2.08c-.89,0-1.42-.59-1.25-1.48l3.15-17.69h-19.42l-3.15,17.69c-.18.89-.89,1.48-1.78,1.48h-2.08c-.89,0-1.42-.59-1.25-1.48Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M816.12,352.24l2.85,2.85c.83.83.95,1.78.12,2.61l-.71.71c-.83.83-1.84.77-2.67-.06l-3.27-3.27c-2.08,2.67-5.46,4.28-9.62,4.28-7.01,0-10.81-3.5-9.86-9.14l.12-.71c.89-5.28,4.93-7.84,12.47-7.84,2.49,0,4.87.36,7.36.95l.77-4.39c.65-3.8-1.19-5.76-6-5.76-4.1,0-6.12,1.42-6.59,4.33l-.12.71c-.12.59-.53.95-1.19.95h-2.73c-.65,0-.95-.36-.83-1.01l.12-.71c.89-5.34,4.69-8.19,11.76-8.19,7.9,0,11.52,3.68,10.39,10.15l-2.38,13.54ZM803.71,355.51c4.27,0,7.3-2.32,7.9-5.7l.65-3.74c-2.49-.71-4.45-1.01-6.95-1.01-4.45,0-6.95,1.54-7.42,4.57l-.12.71c-.59,3.5,1.42,5.17,5.94,5.17Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M830.19,357.05l-4.39-24.7c-.12-.71-.18-1.13-.18-1.42,0-.95.48-1.72,1.66-1.72h1.54c1.07,0,1.43.36,1.66,1.72l3.98,24.4,12.35-24.4c.71-1.37,1.13-1.72,2.2-1.72h1.6c.83,0,1.25.36,1.25,1.07,0,.36-.12.83-.48,1.48l-19.77,38.18c-.65,1.25-1.96,1.6-3.27.95-1.25-.59-1.6-2.02-.83-3.32l5.11-8.85h-.59c-1.13,0-1.6-.42-1.84-1.66Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M854.65,351.83l5.88-33.25c.24-1.25,1.01-2.08,2.32-2.08h.77c1.25,0,2.08.83,1.84,2.08l-5.88,33.25c-.36,2.08.18,2.73,2.02,2.73h2.2c.83,0,1.19.48,1.07,1.25l-.3,1.66c-.12.77-.71,1.25-1.48,1.25h-2.43c-4.99,0-6.83-2.2-6-6.89Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M892.83,352.24l2.85,2.85c.83.83.95,1.78.12,2.61l-.71.71c-.83.83-1.84.77-2.67-.06l-3.27-3.27c-2.08,2.67-5.46,4.28-9.62,4.28-7.01,0-10.81-3.5-9.86-9.14l.12-.71c.89-5.28,4.93-7.84,12.47-7.84,2.49,0,4.87.36,7.36.95l.77-4.39c.65-3.8-1.19-5.76-6-5.76-4.1,0-6.12,1.42-6.59,4.33l-.12.71c-.12.59-.53.95-1.19.95h-2.73c-.65,0-.95-.36-.83-1.01l.12-.71c.89-5.34,4.69-8.19,11.76-8.19,7.9,0,11.52,3.68,10.39,10.15l-2.38,13.54ZM880.42,355.51c4.27,0,7.3-2.32,7.9-5.7l.65-3.74c-2.49-.71-4.45-1.01-6.95-1.01-4.45,0-6.95,1.54-7.42,4.57l-.12.71c-.59,3.5,1.42,5.17,5.94,5.17Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M911.23,357.7c0-.47.12-.83.59-1.78l18.35-36.63c.89-1.78,1.66-2.38,3.21-2.38h2.73c1.6,0,2.32.59,2.55,2.38l5.34,35.98c.12.83.18,1.31.18,1.6,0,.95-.53,1.84-1.84,1.84h-1.42c-1.13,0-1.48-.36-1.66-1.66l-1.54-11.16h-15.79l-5.46,11.16c-.65,1.31-1.13,1.66-2.32,1.66h-1.54c-.89,0-1.37-.42-1.37-1.01ZM937.12,341.61l-2.91-20.66-10.15,20.66h13.06Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M951.55,351.83l5.88-33.25c.24-1.25,1.01-2.08,2.32-2.08h.77c1.25,0,2.08.83,1.84,2.08l-5.88,33.25c-.36,2.08.18,2.73,2.02,2.73h2.2c.83,0,1.19.48,1.07,1.25l-.3,1.66c-.12.77-.71,1.25-1.48,1.25h-2.43c-4.99,0-6.83-2.2-6-6.89Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M972.57,356.93l-4.45-24.58c-.12-.71-.18-1.13-.18-1.42,0-.95.48-1.72,1.66-1.72h1.54c1.07,0,1.43.36,1.66,1.72l3.98,23.69,12.35-23.69c.71-1.37,1.13-1.72,2.2-1.72h1.6c.83,0,1.25.36,1.25,1.07,0,.36-.12.83-.48,1.48l-13.42,25.17c-.77,1.48-1.48,2.02-2.97,2.02h-2.49c-1.54,0-1.96-.53-2.26-2.02Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M996.25,347.91l1.54-8.61c1.31-7.12,5.94-10.75,13.54-10.75s12.05,3.98,10.75,11.22l-.71,4.04c-.24,1.25-.89,1.84-2.08,1.84h-17.69l-.54,3.03c-.77,4.51,1.31,6.83,6.95,6.83,4.45,0,6.59-1.6,7.12-4.69l.06-.36c.12-.59.36-.71.95-.71h3.03c.54,0,.77.24.71.77l-.12.71c-.89,5.4-4.81,8.13-12.23,8.13-8.19,0-12.59-4.16-11.28-11.46ZM1002.78,338.88l-.53,3.03h14.67l.48-2.67c.77-4.45-1.13-6.89-6.41-6.89-4.63,0-7.42,2.02-8.19,6.53Z" />
          <path className="fill-[#a51a8f] dark:fill-white transition-colors" d="M1026.71,351.29l.18-1.01c.12-.59.53-.95,1.13-.95h2.73c.54,0,.83.3.71.83l-.18,1.01c-.48,2.85,1.42,4.39,6.47,4.39,4.63,0,7.01-1.54,7.48-4.33l.12-.71c.42-2.67-.89-3.56-3.56-3.98l-5.76-.95c-5.28-.89-7.66-3.03-6.83-8.19l.12-.71c.89-5.28,4.93-8.13,12.29-8.13s11.16,2.79,10.27,7.78l-.18,1.01c-.12.59-.53.95-1.07.95h-2.79c-.53,0-.83-.3-.71-.83l.18-1.01c.47-2.61-1.42-4.1-6.17-4.1-4.33,0-6.65,1.54-7.12,4.33l-.12.71c-.42,2.61.89,3.56,3.56,3.98l5.76.95c5.28.89,7.6,3.03,6.77,8.13l-.12.71c-.89,5.34-4.99,8.19-12.59,8.19s-11.52-2.85-10.57-8.08Z" />
        </g>
      </g>
    </g>
  </svg>
);



// --- UI HELPERS ---
const NavButton = ({ active, onClick, icon, label, dark = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
      ? dark ? 'bg-[#eec00a] text-[#2d1b36] shadow-lg' : 'bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/30'
      : dark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
      }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    {label}
  </button>
);

const MobileNavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'text-[#a51a8f] bg-[#fdf2fa]' : 'text-slate-400'
      }`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

// --- DADOS INICIAIS (SEEDER) ---
const seedDatabase = async (currentUserId) => {
  if (!currentUserId) return;

  const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
  const classesRef = collection(db, 'artifacts', appId, 'public', 'data', 'classes');
  const quizzesRef = collection(db, 'artifacts', appId, 'public', 'data', 'quizzes');

  const users = [
    { id: 'admin1', name: 'Diretor(a)', avatar: 'ðŸ‘”', xp: 0, level: 99, coins: 0, password: 'admin', role: 'admin' },
    { id: 'teacher1', name: 'Prof. Substituto', avatar: 'ðŸ‘©â€ðŸ«', xp: 0, level: 50, coins: 0, password: 'teacher', role: 'teacher' },
    { id: 'st1', name: 'Ana Silva', avatar: 'ðŸ‘©â€ðŸ”¬', xp: 2450, level: 5, coins: 320, password: '1234', role: 'student', schoolYear: '9Âº Ano', userCode: 'ANA1234', photoUrl: '' },
    { id: 'st2', name: 'JoÃ£o Pedro', avatar: 'ðŸ‘¨â€ðŸŽ¨', xp: 150, level: 1, coins: 5, password: '1234', role: 'student', schoolYear: '6Âº Ano', userCode: 'JOAO5678', photoUrl: '' },
    { id: 'st3', name: 'Beatriz Costa', avatar: 'ðŸ‘©â€ðŸš€', xp: 1200, level: 3, coins: 150, password: '1234', role: 'student', schoolYear: '8Âº Ano', userCode: 'BEA9012', photoUrl: '' },
  ];

  for (const u of users) {
    await setDoc(doc(usersRef, u.id), u);
  }

  const classes = [
    {
      id: 'cl1',
      title: 'IntroduÃ§Ã£o Ã  GramÃ¡tica',
      classCode: 'AUL1001',
      date: '15/10 - 14:00',
      description: 'Nossa primeira aula sobre a estrutura da lÃ­ngua portuguesa.',
      recordingLink: 'https://youtube.com/example',
      materials: [{ type: 'pdf', title: 'Slides da Aula 1.pdf' }],
      status: 'completed',
      sortOrder: 1,
      assignedTo: [],
      createdBy: 'Diretor(a)'
    },
    {
      id: 'cl2',
      title: 'A Aventura dos Substantivos',
      classCode: 'AUL2023',
      date: 'AGORA - AO VIVO',
      description: 'Entre agora para participar da aula interativa sobre substantivos!',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      materials: [{ type: 'pdf', title: 'Resumo da Aula.pdf' }],
      status: 'live',
      sortOrder: 2,
      assignedTo: [],
      createdBy: 'Prof. Substituto'
    }
  ];

  for (const cl of classes) {
    await setDoc(doc(classesRef, cl.id), cl);
  }

  const quizzes = [
    {
      id: 'qz1',
      title: 'Desafio RÃ¡pido: Substantivos',
      challengeCode: 'DES1001',
      xpReward: 100,
      coinReward: 10,
      assignedTo: [],
      completedBy: [],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      createdBy: 'Diretor(a)',
      questions: [
        { type: 'multiple_choice', q: 'Qual destas palavras Ã© um substantivo prÃ³prio?', options: ['cadeira', 'correr', 'Brasil', 'azul'], answer: 'Brasil' },
        { type: 'multiple_choice', q: 'O plural de "pÃ£o" Ã©:', options: ['pÃ£os', 'pÃ£es', 'paÃµes', 'panes'], answer: 'pÃ£es' }
      ]
    },
    {
      id: 'qz2',
      title: 'Mestre da InterpretaÃ§Ã£o',
      challengeCode: 'DES2045',
      xpReward: 300,
      coinReward: 25,
      assignedTo: [],
      completedBy: [],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      createdBy: 'Prof. Substituto',
      questions: [
        { type: 'multiple_choice', q: 'No texto "O vento sussurrava nas Ã¡rvores", qual figura de linguagem estÃ¡ presente?', options: ['MetÃ¡fora', 'PersonificaÃ§Ã£o', 'HipÃ©rbole', 'AntÃ­tese'], answer: 'PersonificaÃ§Ã£o' },
        { type: 'multiple_choice', q: 'Qual Ã© o antÃ´nimo de "efÃªmero"?', options: ['Passageiro', 'Duradouro', 'RÃ¡pido', 'Breve'], answer: 'Duradouro' },
        { type: 'multiple_choice', q: 'Em "Ele comeu dois pratos", temos um exemplo de:', options: ['MetonÃ­mia', 'Catacrese', 'Sinestesia', 'Pleonasmo'], answer: 'MetonÃ­mia' },
        { type: 'short_answer', q: 'Qual o sentimento predominante quando dizemos que estamos com "saudade"?', answer: 'Falta' },
        { type: 'long_answer', q: 'Explique com suas palavras a moral da fÃ¡bula "A Cigarra e a Formiga".', answer: 'A importÃ¢ncia de trabalhar e se preparar para o futuro, nÃ£o apenas se divertir.' }
      ]
    },
    {
      id: 'qz3',
      title: 'Desafio de Ortografia',
      challengeCode: 'DES3099',
      xpReward: 250,
      coinReward: 20,
      assignedTo: [],
      completedBy: [],
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      createdBy: 'Diretor(a)',
      questions: [
        { type: 'multiple_choice', q: 'Qual a forma correta?', options: ['ExceÃ§Ã£o', 'EceÃ§Ã£o', 'ExcessÃ£o', 'ExcecÃ£o'], answer: 'ExceÃ§Ã£o' },
        { type: 'multiple_choice', q: 'Complete: "Ele nÃ£o fez ___ esforÃ§o."', options: ['nenhum', 'nem um', 'nehum', 'nÃ©mum'], answer: 'nenhum' },
        { type: 'multiple_choice', q: 'A palavra "ideia" tem acento?', options: ['Sim', 'NÃ£o', 'Depende', 'Ã€s vezes'], answer: 'NÃ£o' },
        { type: 'short_answer', q: 'Escreva o aumentativo de "muro".', answer: 'Muralha' },
        { type: 'long_answer', q: 'Crie uma frase usando corretamente as palavras "mas" e "mais".', answer: 'Eu queria ir, mas nÃ£o tenho mais dinheiro.' }
      ]
    },
    {
      id: 'qz4',
      title: 'VocabulÃ¡rio AvanÃ§ado',
      challengeCode: 'DES4102',
      xpReward: 400,
      coinReward: 40,
      assignedTo: [],
      completedBy: [],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      createdBy: 'Diretor(a)',
      questions: [
        { type: 'multiple_choice', q: 'O que significa a palavra "altruÃ­sta"?', options: ['EgoÃ­sta', 'SolidÃ¡rio', 'Rico', 'Alto'], answer: 'SolidÃ¡rio' },
        { type: 'multiple_choice', q: 'Qual palavra Ã© sinÃ´nimo de "contente"?', options: ['Triste', 'Alegre', 'Raivoso', 'Cansado'], answer: 'Alegre' },
        { type: 'multiple_choice', q: 'Complete o provÃ©rbio: "Ãgua mole em pedra dura..."', options: ['...tanto bate atÃ© que fura', '...nunca fura', '...molha tudo', '...vira rio'], answer: '...tanto bate atÃ© que fura' },
        { type: 'short_answer', q: 'Qual Ã© o substantivo coletivo de "lobos"?', answer: 'Alcateia' },
        { type: 'long_answer', q: 'Defina o que Ã© "Empatia" em uma frase.', answer: 'Capacidade de se colocar no lugar do outro.' }
      ]
    }
  ];

  for (const qz of quizzes) {
    await setDoc(doc(quizzesRef, qz.id), qz);
  }

  alert('Banco de dados atualizado!');
};

// --- COMPONENTES DE VISUALIZAÃ‡ÃƒO ---

const ViewHome = ({ student, classes, onOpenRank }) => {
  const myClasses = classes.filter(c => !c.assignedTo || c.assignedTo.length === 0 || c.assignedTo.includes(student.id));
  const activeClass = myClasses.find(c => c.status === 'live') || myClasses.find(c => c.status === 'soon') || myClasses.find(c => c.status === 'locked');

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel de Controle</h2><p className="text-slate-500 dark:text-slate-400">Bem-vindo de volta!</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenRank}
            className="flex items-center gap-2 bg-[#a51a8f] hover:bg-[#8e167b] text-white px-4 py-2 rounded-full border border-[#a51a8f] shadow-sm h-12 transition-all active:scale-95"
          >
            <Trophy size={18} className="text-[#eec00a]" />
            <span className="font-bold text-sm">Ranking</span>
          </button>
          <div className="flex items-center gap-2 bg-[#fff9db] dark:bg-yellow-900/30 px-4 py-2 rounded-full border border-[#eec00a] shadow-sm h-12 select-none"><Star className="w-5 h-5 text-[#eec00a] fill-[#eec00a]" /><span className="font-bold text-[#b89508] dark:text-[#eec00a]">{student.coins}</span></div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-default h-12">
            <div className="w-10 h-10 rounded-full bg-[#fdf2fa] dark:bg-slate-700 flex items-center justify-center text-xl border border-[#a51a8f]/20 overflow-hidden">{student.photoUrl ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" /> : student.avatar}</div>
            <div className="flex flex-col justify-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">NÃ­vel {student.level}</span><div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden"><div className="bg-[#a51a8f] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((student.xp % 1000) / 10, 100)}%` }}></div></div></div>
          </div>
        </div>
      </header>
      <section>
        <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">{activeClass?.status === 'live' ? <Radio className="w-5 h-5 text-red-500 animate-pulse" /> : activeClass?.status === 'soon' ? <Clock className="w-5 h-5 text-[#eec00a]" /> : <Video className="w-5 h-5 text-[#a51a8f]" />}{activeClass?.status === 'live' ? 'Acontecendo Agora' : 'PrÃ³xima Aula'}</h3>
        {activeClass ? (
          <div className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group transition-all duration-500 ${activeClass.status === 'live' ? 'bg-gradient-to-r from-[#a51a8f] to-[#7d126b] ring-4 ring-[#a51a8f]/20' : activeClass.status === 'soon' ? 'bg-gradient-to-r from-[#eec00a] to-[#d4ab09] text-yellow-900' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3"><span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">{activeClass.date}</span>{activeClass.status === 'live' && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">AO VIVO</span>}{activeClass.status === 'soon' && <span className="bg-white/30 text-yellow-900 text-xs px-2 py-1 rounded font-bold">EM BREVE</span>}</div>
              <h4 className={`text-2xl font-bold mb-2 ${activeClass.status === 'soon' ? 'text-yellow-900' : 'text-white'}`}>{activeClass.title}</h4>
              <p className={`mb-6 max-w-md ${activeClass.status === 'soon' ? 'text-yellow-800' : 'text-[#fdf2fa]'}`}>{activeClass.description}</p>
              {activeClass.status !== 'locked' ? (<a href={activeClass.meetLink} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg ${activeClass.status === 'soon' ? 'bg-white text-yellow-900 hover:bg-yellow-50' : 'bg-[#eec00a] text-[#7d126b] hover:bg-[#d4ab09]'}`}><Video className="w-5 h-5" />{activeClass.status === 'live' ? 'Entrar Agora' : 'Link do Meet'}</a>) : (<button disabled className="inline-flex items-center gap-2 bg-white/10 text-slate-300 px-6 py-3 rounded-xl font-bold cursor-not-allowed"><Lock className="w-5 h-5" />Bloqueada</button>)}
            </div>
          </div>
        ) : (<div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">Nenhuma aula agendada por enquanto.</div>)}
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Star className="w-5 h-5 text-[#eec00a]" />Destaque da Semana</h4><p className="text-sm text-slate-600">ParabÃ©ns ao aluno <strong>Lucas</strong> por completar todos os desafios de gramÃ¡tica!</p></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" />Lembrete</h4><p className="text-sm text-slate-600">NÃ£o esqueÃ§am de baixar o PDF da aula sobre "Verbos" na aba Jornada.</p></div>
      </section>
    </div>
  );
};

const ViewJourney = ({ classes }) => {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sua Jornada</h2><p className="text-slate-500 dark:text-slate-400">Explore as aulas e materiais</p></header>
      <div className="relative">
        <div className="absolute left-4 md:left-8 top-4 bottom-0 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        <div className="space-y-8">
          {classes.map((cls, idx) => {
            const isLive = cls.status === 'live'; const isSoon = cls.status === 'soon'; const isCompleted = cls.status === 'completed'; const isLocked = cls.status === 'locked';
            return (
              <div key={cls.id} className={`relative pl-12 md:pl-20 transition-all duration-500 ${isLive ? 'z-20' : isSoon ? 'z-10' : 'opacity-90 hover:opacity-100'}`}>
                <div className={`absolute left-0 md:left-4 top-0 rounded-full flex items-center justify-center transition-all duration-300 ${isLive ? 'w-10 h-10 md:w-12 md:h-12 bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/40 ring-4 ring-[#fdf2fa] dark:ring-slate-800 -ml-0.5 md:-ml-1.5 animate-pulse' : isSoon ? 'w-10 h-10 md:w-12 md:h-12 bg-[#eec00a] text-[#7d126b] shadow-lg ring-4 ring-[#fff9db] dark:ring-slate-800 -ml-0.5 md:-ml-1.5' : 'w-9 h-9 md:w-9 md:h-9 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'} ${isCompleted ? '!bg-green-500 !border-green-500 !text-white' : ''}`}>
                  {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle size={20} /> : isSoon ? <Clock size={24} /> : <Radio size={24} />}
                </div>
                <div className={`rounded-2xl border transition-all duration-300 relative ${isLive ? 'bg-white dark:bg-slate-800 border-[#a51a8f] shadow-2xl shadow-[#a51a8f]/20 p-6 md:p-8 scale-105 origin-left ring-2 ring-[#a51a8f]/10' : isSoon ? 'bg-[#fff9db] dark:bg-yellow-900/10 border-[#eec00a] p-6 shadow-md scale-100' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-3"><span className={`text-xs font-bold uppercase tracking-wider ${isLive ? 'text-[#a51a8f]' : isSoon ? 'text-yellow-700 dark:text-yellow-500' : 'text-slate-400'}`}>{cls.date}</span>{isLive && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-extrabold shadow-sm animate-pulse">AO VIVO</span>}{isSoon && <span className="bg-[#eec00a] text-[#7d126b] text-xs px-3 py-1 rounded-full font-bold">EM BREVE</span>}{isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded font-bold">Encerrada</span>}{isLocked && <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded font-bold">Bloqueada</span>}</div>
                  <h3 className={`font-bold text-slate-800 dark:text-white mb-2 ${isLive ? 'text-2xl' : 'text-lg'}`}>{cls.title}</h3>
                  <p className={`mb-4 ${isLive ? 'text-slate-600 dark:text-slate-300 text-base' : 'text-slate-500 dark:text-slate-400 text-sm'}`}>{cls.description}</p>
                  {!isLocked && (
                    <div className={`flex flex-wrap gap-3 pt-4 border-t ${isLive ? 'border-[#a51a8f]/10' : isSoon ? 'border-yellow-200 dark:border-yellow-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                      {cls.recordingLink ? (<a href={cls.recordingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><PlayCircle className="w-4 h-4" />Assistir GravaÃ§Ã£o</a>) : (cls.meetLink && (<a href={cls.meetLink} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isLive ? 'bg-[#a51a8f] text-white hover:bg-[#7d126b] shadow-md shadow-[#a51a8f]/30' : isSoon ? 'bg-[#eec00a] text-[#7d126b] hover:bg-[#d4ab09]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}><Video className="w-4 h-4" />{isLive ? 'Entrar na Aula' : isSoon ? 'Link da Aula' : 'Acessar'}</a>))}
                      {cls.materials?.map((mat, i) => (<button key={i} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLive || isSoon ? 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-black/40' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}><FileText className="w-4 h-4" />{mat.title}</button>))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ViewCalendar = ({ classes }) => {
  const daysInMonth = 31; const startDayOffset = 2; const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState(null);
  const classesByDay = classes.reduce((acc, cls) => {
    let day = null; if (cls.date.includes('/')) day = parseInt(cls.date.split('/')[0]); else if (cls.date.includes('AGORA') || cls.date.includes('AO VIVO')) day = 20; else if (cls.date.includes('HOJE')) day = 22;
    if (day) { if (!acc[day]) acc[day] = []; acc[day].push(cls); } return acc;
  }, {});
  const selectedClasses = selectedDay ? classesByDay[selectedDay] : null;

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn relative">
      <header className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">CalendÃ¡rio de Aulas</h2><p className="text-slate-500 dark:text-slate-400">Organize-se com a programaÃ§Ã£o mensal</p></div><div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-400" /><span className="font-bold text-slate-700 dark:text-slate-200">Outubro</span><ChevronRight className="w-5 h-5 text-slate-400" /></div></header>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
        <div className="grid grid-cols-7 mb-4 text-center">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'].map(d => (<div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>))}</div>
        <div className="grid grid-cols-7 gap-2 md:gap-4">{Array.from({ length: startDayOffset }).map((_, i) => (<div key={`empty-${i}`} className="aspect-square"></div>))}{days.map(day => { const hasClass = classesByDay[day]?.length > 0; const isSelected = selectedDay === day; const status = hasClass ? classesByDay[day][0].status : null; let bgClass = 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'; if (isSelected) bgClass = 'bg-[#a51a8f] text-white shadow-lg ring-4 ring-[#fdf2fa] dark:ring-slate-600'; else if (status === 'live') bgClass = 'bg-[#fdf2fa] dark:bg-[#a51a8f]/20 border-2 border-[#a51a8f] text-[#a51a8f] dark:text-[#d36ac1]'; else if (status === 'soon') bgClass = 'bg-[#fff9db] dark:bg-yellow-900/20 border-2 border-[#eec00a] text-[#7d126b] dark:text-[#eec00a]'; else if (hasClass) bgClass = 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'; return (<button key={day} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 ${bgClass}`}><span className={`text-lg md:text-xl font-bold ${isSelected ? 'scale-110' : ''}`}>{day}</span>{hasClass && (<div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : status === 'live' ? 'bg-[#a51a8f] animate-pulse' : 'bg-slate-400'}`}></div>)}</button>); })}</div>
      </div>
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedDay(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><CalendarDays className="w-5 h-5" />{selectedDay} de Outubro</h3><button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button></div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">{selectedClasses && selectedClasses.length > 0 ? (<div className="space-y-4">{selectedClasses.map(cls => (<div key={cls.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"><div className={`p-3 rounded-lg ${cls.status === 'live' ? 'bg-[#fdf2fa] dark:bg-[#a51a8f]/20 text-[#a51a8f] dark:text-[#d36ac1]' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>{cls.status === 'live' ? <Radio className="w-6 h-6 animate-pulse" /> : <Video className="w-6 h-6" />}</div><div><h4 className="font-bold text-slate-800 dark:text-white">{cls.title}</h4><p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{cls.description}</p><div className="flex gap-2"><span className={`text-xs font-bold px-2 py-1 rounded ${cls.status === 'live' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>{cls.status === 'live' ? 'AO VIVO' : cls.status === 'completed' ? 'ENCERRADA' : 'AGENDADA'}</span></div></div></div>))}</div>) : (<div className="text-center py-8"><div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><CalendarDays size={32} /></div><p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma aula registrada para este dia.</p></div>)}</div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center"><button onClick={() => setSelectedDay(null)} className="text-[#a51a8f] dark:text-[#d36ac1] font-bold text-sm hover:underline">Fechar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewChallenges = ({ student, quizzes, onCompleteQuiz }) => {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [mySubmissions, setMySubmissions] = useState({}); // Map quizId -> submission
  const myChallenges = quizzes.filter(q => !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id));
  const [timeLeft, setTimeLeft] = useState(null);
  const [pendingStartQuiz, setPendingStartQuiz] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), where("studentId", "==", student.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        subs[data.quizId] = { id: doc.id, ...data };
      });
      setMySubmissions(subs);
    });
    return () => unsubscribe();
  }, [student.id]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const startQuiz = (quiz) => {
    // If already submitted and graded, show feedback
    const sub = mySubmissions[quiz.id];
    if (sub && sub.status === 'graded') {
      setActiveQuiz(quiz); // We will use activeQuiz to show the feedback view
      return;
    }
    // If pending, show alert says "Under review"
    if (sub && sub.status === 'pending') {
      alert("Este desafio estÃ¡ em correÃ§Ã£o pelo professor. Aguarde o retorno!");
      return;
    }

    // Check for timer interception
    const limit = quiz.timeLimit ? parseInt(quiz.timeLimit) : 0;
    if (!isNaN(limit) && limit > 0 && (!sub || sub.status !== 'completed')) {
      setPendingStartQuiz(quiz);
      return;
    }

    confirmStartQuiz(quiz);
  };

  const confirmStartQuiz = (quiz) => {
    setPendingStartQuiz(null);
    const sub = mySubmissions[quiz.id];

    setActiveQuiz(quiz);
    setAnswers({});
    setScore(null);

    // Initialize timer if applicable
    const limit = quiz.timeLimit ? parseInt(quiz.timeLimit) : 0;
    if (!isNaN(limit) && limit > 0 && (!sub || sub.status !== 'completed')) {
      console.log("Starting timer:", limit, "minutes");
      setTimeLeft(limit * 60);
    } else {
      console.log("No timer or invalid limit:", quiz.timeLimit);
      setTimeLeft(null);
    }
  };

  const handleAnswer = (qIndex, option) => { setAnswers(prev => ({ ...prev, [qIndex]: option })); };
  const submitQuiz = async () => {
    setTimeLeft(null); // Stop timer
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const studentAnswer = answers[idx];
      const correct = q.answer;
      if (q.type === 'short_answer' || q.type === 'long_answer') {
        if (studentAnswer && studentAnswer.toLowerCase().trim() === correct.toLowerCase().trim()) correctCount++;
      } else {
        if (studentAnswer === correct) correctCount++;
      }
    });

    // Save submission to Firestore
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), {
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        studentId: student.id,
        studentName: student.name,
        answers: answers,
        score: correctCount, // Provisional score for auto-graded questions
        totalQuestions: activeQuiz.questions.length,
        status: 'pending', // Pending teacher review
        submittedAt: serverTimestamp(),
        questions: activeQuiz.questions // Snapshot of questions at time of submission
      });

      setScore(correctCount);
      if (correctCount > 0) onCompleteQuiz(activeQuiz.id, activeQuiz.xpReward, activeQuiz.coinReward);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Erro ao enviar desafio. Tente novamente.");
    }
  };

  // RENDER ACTIVE QUIZ OR FEEDBACK
  if (activeQuiz) {
    const sub = mySubmissions[activeQuiz.id];
    const isGradedView = sub && sub.status === 'graded';

    // Format timer
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isGradedView) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col animate-slideUp">
          <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2"><FileCheck className="text-[#eec00a]" /> Resultado: {activeQuiz.title}</h3>
            </div>
            <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-600">
                <p className="text-xs font-bold text-slate-400 uppercase">Nota Final</p>
                <p className="text-3xl font-bold text-[#a51a8f] dark:text-[#d36ac1]">{sub.score} / {sub.totalQuestions}</p>
              </div>
              {sub.teacherBonusXP > 0 && (
                <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-600">
                  <p className="text-xs font-bold text-slate-400 uppercase">BÃ´nus Extra</p>
                  <p className="text-xl font-bold text-[#eec00a]">+{sub.teacherBonusXP} XP</p>
                </div>
              )}
              <div className="flex-1 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Corrigido em</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{sub.gradedAt ? new Date(sub.gradedAt.seconds * 1000).toLocaleDateString() : 'Recentemente'}</p>
              </div>
            </div>

            {sub.teacherFeedback && (
              <div className="bg-[#fdf2fa] dark:bg-[#a51a8f]/10 p-4 rounded-xl border border-[#a51a8f]/20">
                <h4 className="font-bold text-[#a51a8f] dark:text-[#d36ac1] mb-2 flex items-center gap-2"><MessageSquare size={16} /> ComentÃ¡rio do Professor</h4>
                <p className="text-slate-700 italic">"{sub.teacherFeedback}"</p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 border-b pb-2">Detalhes da CorreÃ§Ã£o</h4>
              {sub.questions && sub.questions.map((q, idx) => {
                // questionsStatus is saved by teacher: { 0: true, 1: false }
                const isCorrect = sub.questionsStatus ? sub.questionsStatus[idx] : (sub.score > idx); // Fallback if missing
                // Actually, fallback is tricky. If questionsStatus exists, use it.
                // If not (legacy), rely on auto-grade logic? But we just added it.
                // Let's assume questionsStatus exists for graded items.
                // If not, we can infer from answers match.
                let status = isCorrect;
                if (sub.questionsStatus && sub.questionsStatus[idx] !== undefined) {
                  status = sub.questionsStatus[idx];
                }

                return (
                  <div key={idx} className={`border-l-4 p-4 rounded-r-xl bg-white shadow-sm ${status ? 'border-green-400' : 'border-red-400'}`}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-800 text-sm mb-1">{idx + 1}. {q.q}</p>
                      {status ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-bold text-slate-400 text-xs uppercase">Sua Resposta:</span> {sub.answers[idx] || "â€”"}
                    </p>
                    {/* Show Teacher Specific Correction if available, otherwise show Answer Key for incorrect */}
                    {sub.teacherCorrections && sub.teacherCorrections[idx] ? (
                      <div className="mt-2 text-sm bg-blue-50 border border-blue-100 p-2 rounded">
                        <span className="font-bold text-blue-700 text-xs uppercase block mb-1">CorreÃ§Ã£o do Professor:</span>
                        <span className="text-blue-900">{sub.teacherCorrections[idx]}</span>
                      </div>
                    ) : !status && (q.type !== 'short_answer' && q.type !== 'long_answer') && (
                      <p className="text-sm text-slate-600 bg-green-50 px-2 py-1 rounded inline-block mt-1">
                        <span className="font-bold text-green-700 text-xs uppercase">Gabarito:</span> {q.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center relative">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {activeQuiz.title}
            {timeLeft !== null && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>
            )}
          </h3>
          <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {score === null ? (
            <div className="space-y-8">{activeQuiz.questions.map((q, idx) => (<div key={idx} className="bg-slate-50 p-4 rounded-xl"><p className="font-bold text-slate-800 mb-4 text-lg">{idx + 1}. {q.q}</p>{(q.type === 'multiple_choice' || q.type === 'true_false') && (<div className="grid grid-cols-1 gap-3">{q.options.map((opt) => (<button key={opt} onClick={() => handleAnswer(idx, opt)} className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${answers[idx] === opt ? 'border-[#a51a8f] bg-[#fdf2fa] text-[#a51a8f] font-bold' : 'border-slate-200 hover:border-[#a51a8f]/50 text-slate-600'}`}>{opt}</button>))}</div>)}{q.type === 'short_answer' && (<input type="text" placeholder="Sua resposta..." className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#a51a8f] focus:outline-none" value={answers[idx] || ''} onChange={(e) => handleAnswer(idx, e.target.value)} />)}{q.type === 'long_answer' && (<textarea rows={4} placeholder="Digite sua resposta aqui..." className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#a51a8f] focus:outline-none" value={answers[idx] || ''} onChange={(e) => handleAnswer(idx, e.target.value)}></textarea>)}</div>))}<button onClick={submitQuiz} disabled={Object.keys(answers).length !== activeQuiz.questions.length} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Enviar Respostas</button></div>
          ) : (
            <div className="text-center py-10 animate-fadeIn"><div className="w-24 h-24 bg-[#eec00a] rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-lg animate-bounce text-white"><Star size={48} fill="white" /></div><h3 className="text-3xl font-bold text-slate-800 mb-2">Desafio Enviado!</h3><p className="text-slate-600 mb-6">Suas respostas foram enviadas para correÃ§Ã£o.</p><div className="flex justify-center gap-4 mb-8"><div className="bg-[#fdf2fa] px-4 py-2 rounded-lg"><span className="block text-xs text-[#a51a8f] font-bold uppercase">Ganhou</span><span className="text-xl font-bold text-[#7d126b]">+{activeQuiz.xpReward} XP</span></div><div className="bg-[#fff9db] px-4 py-2 rounded-lg"><span className="block text-xs text-[#b89508] font-bold uppercase">Ganhou</span><span className="flex items-center gap-1 text-xl font-bold text-[#b89508]">+{activeQuiz.coinReward} <Star className="w-4 h-4 fill-[#b89508]" /></span></div></div><button onClick={() => setActiveQuiz(null)} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8e167b]">Voltar aos Desafios</button></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header><h2 className="text-2xl font-bold text-slate-800">Sala de Desafios</h2><p className="text-slate-500">Teste seus conhecimentos e ganhe prÃªmios</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myChallenges.map(quiz => {
          const isCompleted = quiz.completedBy?.includes(student.id);
          const isExpired = quiz.deadline && new Date() > new Date(quiz.deadline);
          return (
            <div key={quiz.id} className={`bg-white p-6 rounded-2xl border-2 transition-all ${isCompleted ? 'border-green-200 bg-green-50' : isExpired ? 'border-slate-200 bg-slate-100 grayscale' : 'border-slate-100 hover:border-[#a51a8f]/50 shadow-md'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-200 text-green-700' : isExpired ? 'bg-slate-300 text-slate-500' : 'bg-[#fdf2fa] text-[#a51a8f]'}`}><Gamepad2 className="w-6 h-6" /></div>
                {/* Status Badge Update */}
                {mySubmissions[quiz.id]?.status === 'pending' ? (
                  <span className="flex items-center gap-1 text-orange-600 font-bold text-sm bg-orange-100 px-2 py-1 rounded-full"><Clock className="w-4 h-4" /> Em AnÃ¡lise</span>
                ) : mySubmissions[quiz.id]?.status === 'graded' ? (
                  <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle className="w-4 h-4" /> Ver Nota</span>
                ) : isCompleted ? (
                  <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle className="w-4 h-4" /> Enviado</span>
                ) : isExpired ? (
                  <span className="flex items-center gap-1 text-slate-500 font-bold text-sm bg-slate-200 px-2 py-1 rounded-full"><Clock className="w-4 h-4" /> Encerrado</span>
                ) : (
                  <span className="flex items-center gap-1 text-[#b89508] font-bold text-sm bg-[#fff9db] px-2 py-1 rounded-full border border-[#eec00a]">+{quiz.xpReward} XP</span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {quiz.title}
                {quiz.challengeCode && <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{quiz.challengeCode}</span>}
              </h3>
              <p className="text-slate-500 text-sm mb-6 mt-2">Responda {quiz.questions?.length} questÃµes para ganhar pontos.</p>
              {quiz.timeLimit && parseInt(quiz.timeLimit) > 0 && (<div className="flex items-center gap-1 text-xs text-orange-600 font-bold mb-2 bg-orange-50 px-2 py-1 rounded w-fit"><Clock size={12} /> Limite de Tempo: {quiz.timeLimit} min</div>)}
              {quiz.deadline && !isCompleted && !isExpired && (<div className="text-xs text-red-500 font-bold mb-4 flex items-center gap-1"><Clock size={12} /> Expira em: {new Date(quiz.deadline).toLocaleString()}</div>)}
              <button onClick={() => startQuiz(quiz)} disabled={isExpired && !isCompleted} className={`w-full py-3 rounded-xl font-bold transition-colors ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700' : isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#a51a8f] text-white hover:bg-[#8e167b] shadow-lg shadow-[#a51a8f]/20'}`}>
                {mySubmissions[quiz.id]?.status === 'graded' ? 'Ver Resultado' : mySubmissions[quiz.id]?.status === 'pending' ? 'Aguardar CorreÃ§Ã£o' : isCompleted ? 'Enviado' : isExpired ? 'Prazo Esgotado' : 'ComeÃ§ar Desafio'}
              </button>
            </div>
          );
        })}
        {myChallenges.length === 0 && (<p className="text-slate-400 col-span-full text-center py-10">VocÃª nÃ£o tem desafios pendentes no momento.</p>)}
      </div>

      {/* START QUIZ WARNING MODAL */}
      {pendingStartQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Desafio com Tempo!</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Este desafio tem um limite de <strong className="text-[#a51a8f]">{pendingStartQuiz.timeLimit} minutos</strong>.
              <br /><span className="text-xs mt-2 block">O cronÃ´metro comeÃ§a assim que vocÃª clicar em iniciar.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPendingStartQuiz(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={() => confirmStartQuiz(pendingStartQuiz)} className="flex-1 py-3 bg-[#a51a8f] text-white rounded-xl font-bold hover:bg-[#7d126b] shadow-lg">Iniciar Agora</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewRank = ({ students, currentStudentId }) => {
  const sortedStudents = [...students].sort((a, b) => b.xp - a.xp);
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="text-center md:text-left"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ranking da Turma</h2><p className="text-slate-500 dark:text-slate-400">Quem serÃ¡ o Mestre da LÃ­ngua?</p></header>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="bg-[#a51a8f] dark:bg-[#7d126b] p-4 text-white font-bold grid grid-cols-6 gap-2 text-sm md:text-base"><div className="col-span-1 text-center">#</div><div className="col-span-3">Aluno</div><div className="col-span-2 text-right">XP</div></div><div className="divide-y divide-slate-100 dark:divide-slate-700">{sortedStudents.map((st, idx) => { const isMe = st.id === currentStudentId; let rankIcon = null; if (idx === 0) rankIcon = 'ðŸ¥‡'; if (idx === 1) rankIcon = 'ðŸ¥ˆ'; if (idx === 2) rankIcon = 'ðŸ¥‰'; return (<div key={st.id} className={`grid grid-cols-6 gap-2 p-4 items-center ${isMe ? 'bg-[#fff9db] dark:bg-yellow-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}><div className="col-span-1 text-center font-bold text-slate-600 dark:text-slate-400 flex justify-center items-center">{rankIcon ? <span className="text-2xl">{rankIcon}</span> : `#${idx + 1}`}</div><div className="col-span-3 flex items-center gap-3"><div className="w-10 h-10 bg-[#fdf2fa] dark:bg-slate-700 rounded-full flex items-center justify-center text-xl border border-[#a51a8f]/20 overflow-hidden">{st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.avatar}</div><div className="flex flex-col"><span className={`font-bold ${isMe ? 'text-[#a51a8f] dark:text-[#eec00a]' : 'text-slate-700 dark:text-slate-200'}`}>{st.name} {isMe && '(VocÃª)'}</span><span className="text-xs text-slate-400">NÃ­vel {st.level}</span></div></div><div className="col-span-2 text-right font-mono font-bold text-[#a51a8f] dark:text-[#d36ac1]">{st.xp.toLocaleString()} XP</div></div>); })}</div></div>
    </div>
  );
};

// --- VIEW CORRECTIONS (TEACHER) ---
const ViewCorrections = ({ students, quizzes }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [bonusXP, setBonusXP] = useState(0);
  const [manualGrades, setManualGrades] = useState({});
  const [teacherCorrections, setTeacherCorrections] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
      setSubmissions(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSubmission) {
      const initialGrades = {};
      selectedSubmission.questions.forEach((q, idx) => {
        let isCorrect = false;
        const studentAnswer = selectedSubmission.answers[idx];
        const correct = q.answer;
        if (q.type === 'short_answer' || q.type === 'long_answer') {
          if (studentAnswer && studentAnswer.toLowerCase().trim() === correct.toLowerCase().trim()) isCorrect = true;
        } else {
          if (studentAnswer === correct) isCorrect = true;
        }
        initialGrades[idx] = isCorrect;
      });
      setManualGrades(initialGrades);
      setFeedback(selectedSubmission.teacherFeedback || "");
      setBonusXP(selectedSubmission.teacherBonusXP || 0);
      setTeacherCorrections(selectedSubmission.teacherCorrections || {});
    }
  }, [selectedSubmission]);

  const toggleGrade = (idx) => {
    setManualGrades(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleTeacherCorrectionChange = (idx, value) => {
    setTeacherCorrections(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  const handleFinalizeCorrection = async () => {
    if (!selectedSubmission) return;

    try {
      const finalScore = Object.values(manualGrades).filter(v => v === true).length;

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', selectedSubmission.id), {
        status: 'graded',
        teacherFeedback: feedback,
        teacherBonusXP: bonusXP,
        score: finalScore,
        questionsStatus: manualGrades,
        teacherCorrections: teacherCorrections,
        gradedAt: serverTimestamp()
      });

      if (bonusXP > 0) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', selectedSubmission.studentId), {
          xp: increment(bonusXP),
          coins: increment(Math.floor(bonusXP / 10))
        });
      }

      alert("CorreÃ§Ã£o enviada com sucesso!");
      setSelectedSubmission(null);
      setFeedback("");
      setBonusXP(0);
      setManualGrades({});
      setTeacherCorrections({});
    } catch (error) {
      console.error("Error finalizing correction:", error);
      alert("Erro ao salvar correÃ§Ã£o.");
    }
  };

  if (selectedSubmission) {
    const selectedQuizCode = quizzes?.find(q => q.id === selectedSubmission.quizId)?.challengeCode;

    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col animate-slideUp">
        <div className="bg-[#2d1b36] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><FileCheck className="text-[#eec00a]" /> CorreÃ§Ã£o de Desafio</h3>
            <p className="text-white/60 text-sm flex items-center gap-2">
              {selectedSubmission.studentName} - {selectedSubmission.quizTitle}
              {selectedQuizCode && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-[#eec00a]">#{selectedQuizCode}</span>}
            </p>
          </div>
          <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex-1 text-center border-r border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">Nota Atual (Ajustada)</p>
              <p className="text-2xl font-bold text-[#a51a8f]">{Object.values(manualGrades).filter(v => v === true).length} / {selectedSubmission.totalQuestions}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Data Envio</p>
              <p className="text-lg font-bold text-slate-700">{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-slate-700 border-b pb-2">Respostas do Aluno (Clique para alterar correÃ§Ã£o)</h4>
            {selectedSubmission.questions && selectedSubmission.questions.map((q, idx) => {
              const isCorrect = manualGrades[idx];
              return (
                <div key={idx} className={`bg-white border-2 p-4 rounded-xl transition-all ${isCorrect ? 'border-green-100' : 'border-red-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800">{idx + 1}. {q.q} <span className="text-xs font-normal text-slate-400 uppercase ml-2">({q.type})</span></p>
                    <button
                      onClick={() => toggleGrade(idx)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${isCorrect ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {isCorrect ? <Check size={14} /> : <X size={14} />}
                      {isCorrect ? 'Correto' : 'Incorreto'}
                    </button>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Resposta do Aluno:</p>
                    <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50/50 border-green-200 text-green-900' : 'bg-red-50/50 border-red-200 text-red-900'
                      }`}>
                      {selectedSubmission.answers[idx] || <span className="italic text-slate-400">Sem resposta</span>}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Gabarito:</p>
                    <p className="text-sm text-slate-600 font-mono bg-slate-100 inline-block px-2 py-1 rounded">{q.answer || 'N/A'}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-[#a51a8f] uppercase mb-1">Sua CorreÃ§Ã£o / SugestÃ£o:</label>
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:border-[#a51a8f] focus:outline-none"
                      rows={2}
                      placeholder="Escreva a resposta ideal aqui se necessÃ¡rio..."
                      value={teacherCorrections[idx] || ''}
                      onChange={(e) => handleTeacherCorrectionChange(idx, e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-[#fdf2fa] p-6 rounded-xl border border-[#a51a8f]/20">
            <h4 className="font-bold text-[#a51a8f] mb-4 flex items-center gap-2"><MessageSquare size={18} /> Feedback do Professor</h4>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">ComentÃ¡rios:</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#a51a8f]"
                rows={3}
                placeholder="Escreva um recado para o aluno..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">XP Extra (BÃ´nus):</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  className="w-24 border border-slate-200 rounded-xl p-2 font-bold text-[#a51a8f] focus:outline-none focus:border-[#a51a8f]"
                  value={bonusXP}
                  onChange={(e) => setBonusXP(Number(e.target.value))}
                  min="0"
                  max="1000"
                />
                <span className="text-xs text-slate-500">Adicionar XP por boas respostas dissertativas.</span>
              </div>
            </div>

            <button onClick={handleFinalizeCorrection} className="w-full bg-[#a51a8f] text-white py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/20 transition-transform active:scale-95">
              Finalizar e Enviar CorreÃ§Ã£o
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-20 md:pb-0">
      <div className="grid grid-cols-1 gap-4">
        {submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileCheck size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-500">Tudo em dia!</h3>
            <p className="text-slate-400">Nenhuma tarefa pendente de correÃ§Ã£o.</p>
          </div>
        ) : (
          submissions.map(sub => {
            const quizCode = quizzes?.find(q => q.id === sub.quizId)?.challengeCode;
            return (
              <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-[#fdf2fa] flex items-center justify-center text-[#a51a8f]">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      {sub.quizTitle}
                      {quizCode && <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{quizCode}</span>}
                    </h4>
                    <p className="text-sm text-slate-500">Aluno: <span className="font-bold text-slate-700">{sub.studentName}</span></p>
                    <p className="text-xs text-slate-400">{sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString() : 'Data desconhecida'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right mr-4">
                    <span className="block text-xs font-bold text-slate-400 uppercase">Acertos</span>
                    <span className="font-bold text-[#a51a8f] text-lg">{sub.score} / {sub.totalQuestions}</span>
                  </div>
                  <button onClick={() => setSelectedSubmission(sub)} className="bg-[#a51a8f] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#7d126b] text-sm shadow-md">
                    Corrigir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ currentUser, students, classes, quizzes, onLogout }) => {
  const [currentView, setCurrentView] = useState('overview');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [classFilterYear, setClassFilterYear] = useState('Todos');
  const [editingClass, setEditingClass] = useState(null);

  const [newStudentData, setNewStudentData] = useState({ name: '', age: '', gender: 'Masculino', parentName: '', parentEmail: '', parentPhone: '', studentPhone: '', schoolYear: '6Âº Ano', photoUrl: '' });
  const [newClass, setNewClass] = useState({ title: '', date: '', description: '', link: '', type: 'meet', assignedTo: [], materials: [] });
  const [materialInput, setMaterialInput] = useState({ title: '', type: 'pdf', url: '' });
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' });
  const [currentQuestion, setCurrentQuestion] = useState({ type: 'multiple_choice', text: '', options: ['', ''], correctAnswer: '' });

  const totalStudents = students.filter(s => s.role === 'student').length;
  const totalClasses = classes.length;
  const totalRevenue = totalStudents * 150;

  const handleAddStudent = async () => {
    if (!newStudentData.name || !newStudentData.parentName || !newStudentData.parentEmail) return alert("Preencha campos obrigatÃ³rios.");
    const newId = `st${Date.now()}`;
    let userCode; let isUnique = false; const namePart = newStudentData.name.substring(0, 3).toUpperCase();
    let attempts = 0;
    while (!isUnique && attempts < 100) { const numPart = Math.floor(1000 + Math.random() * 9000); userCode = `${namePart}${numPart}`; if (!students.some(s => s.userCode === userCode)) isUnique = true; attempts++; }
    if (!isUnique) return alert("Erro ao gerar cÃ³digo.");
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', newId), { id: newId, ...newStudentData, userCode, avatar: 'ðŸ§‘â€ðŸŽ“', photoUrl: newStudentData.photoUrl || '', xp: 0, level: 1, coins: 0, password: '1234', role: 'student' });
    setNewStudentData({ name: '', age: '', gender: 'Masculino', parentName: '', parentEmail: '', parentPhone: '', studentPhone: '', schoolYear: '6Âº Ano', photoUrl: '' });
    setShowStudentForm(false); alert(`Aluno cadastrado! CÃ³digo: ${userCode}`);
  };

  const handleAddMaterialToClass = () => { if (!materialInput.title) return alert("TÃ­tulo obrigatÃ³rio."); setNewClass({ ...newClass, materials: [...newClass.materials, { ...materialInput }] }); setMaterialInput({ title: '', type: 'pdf', url: '' }); };
  const handleRemoveMaterialFromClass = (index) => { setNewClass({ ...newClass, materials: newClass.materials.filter((_, i) => i !== index) }); };

  const handleAddClass = async () => {
    if (!newClass.title || !newClass.date) return alert("TÃ­tulo e Data sÃ£o obrigatÃ³rios.");
    const newId = `cl${Date.now()}`;
    let classCode; let isUnique = false; let attempts = 0;
    while (!isUnique && attempts < 50) { const numPart = Math.floor(1000 + Math.random() * 9000); classCode = `AUL${numPart}`; if (!classes.some(c => c.classCode === classCode)) isUnique = true; attempts++; }
    const classData = { id: newId, classCode, title: newClass.title, date: newClass.date, description: newClass.description, status: 'locked', materials: newClass.materials, assignedTo: newClass.assignedTo, sortOrder: 99, createdBy: currentUser.name };
    if (newClass.type === 'meet') classData.meetLink = newClass.link; else classData.recordingLink = newClass.link;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', newId), classData);
    setNewClass({ title: '', date: '', description: '', link: '', type: 'meet', assignedTo: [], materials: [] }); alert(`Aula criada por ${currentUser.name}! CÃ³digo: ${classCode}`);
  };

  const handleUpdateClass = async () => { if (!editingClass || !editingClass.title) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', editingClass.id), { title: editingClass.title, date: editingClass.date, description: editingClass.description, meetLink: editingClass.meetLink || '', recordingLink: editingClass.recordingLink || '', assignedTo: editingClass.assignedTo, status: editingClass.status }); setEditingClass(null); alert('Aula atualizada!'); };
  const handleDuplicateClass = (cls) => { setNewClass({ title: cls.title + ' (CÃ³pia)', date: '', description: cls.description, link: cls.meetLink || cls.recordingLink || '', type: cls.meetLink ? 'meet' : 'recording', assignedTo: [], materials: cls.materials || [] }); window.scrollTo({ top: 0, behavior: 'smooth' }); alert('Dados copiados para o formulÃ¡rio.'); };
  const handleDeleteClass = async (classId) => { if (confirm('Excluir aula?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', classId)); }

  const addQuestionToChallenge = () => { if (!currentQuestion.text) return alert("Digite o enunciado."); let qToAdd = { type: currentQuestion.type, q: currentQuestion.text, answer: currentQuestion.correctAnswer }; if (currentQuestion.type === 'multiple_choice') qToAdd.options = currentQuestion.options.filter(o => o.trim() !== ''); else if (currentQuestion.type === 'true_false') qToAdd.options = ['Verdadeiro', 'Falso']; setNewChallenge({ ...newChallenge, questions: [...newChallenge.questions, qToAdd] }); setCurrentQuestion({ type: 'multiple_choice', text: '', options: ['', ''], correctAnswer: '' }); };
  const handleEditChallenge = (quiz) => { setNewChallenge({ id: quiz.id, title: quiz.title, xpReward: quiz.xpReward, coinReward: quiz.coinReward, questions: quiz.questions, assignedTo: quiz.assignedTo || [], deadline: quiz.deadline || '', timeLimit: quiz.timeLimit || '' }); setShowChallengeForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const saveChallenge = async () => {
    if (!newChallenge.title || newChallenge.questions.length === 0) return alert("Adicione tÃ­tulo e questÃµes.");
    const data = { title: newChallenge.title, xpReward: newChallenge.xpReward, coinReward: newChallenge.coinReward, questions: newChallenge.questions, assignedTo: newChallenge.assignedTo || [], deadline: newChallenge.deadline || '', timeLimit: newChallenge.timeLimit || '' };

    if (newChallenge.id) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', newChallenge.id), data);
      alert("Desafio atualizado!");
    } else {
      const newId = `qz${Date.now()}`;

      let challengeCode;
      let isUnique = false;
      let attempts = 0;
      const currentCodes = quizzes.map(q => q.challengeCode);

      while (!isUnique && attempts < 50) {
        const numPart = Math.floor(1000 + Math.random() * 9000);
        challengeCode = `DES${numPart}`;
        if (!currentCodes.includes(challengeCode)) isUnique = true;
        attempts++;
      }

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', newId), {
        id: newId,
        challengeCode,
        ...data,
        completedBy: [],
        createdBy: currentUser.name
      });
      alert(`Desafio criado por ${currentUser.name}! CÃ³digo: ${challengeCode}`);
    }
    setNewChallenge({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' }); setShowChallengeForm(false);
  };

  const deleteChallenge = async (id) => { if (confirm("Excluir desafio?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', id)); };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><Users size={24} /></div><div><p className="text-sm text-slate-500">Total de Alunos</p><p className="text-2xl font-bold text-slate-800">{totalStudents}</p></div></div>
            {currentUser.role === 'admin' && (<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div><div><p className="text-sm text-slate-500">Receita Mensal (Est.)</p><p className="text-2xl font-bold text-slate-800">R$ {totalRevenue},00</p></div></div>)}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Video size={24} /></div><div><p className="text-sm text-slate-500">Aulas Criadas</p><p className="text-2xl font-bold text-slate-800">{totalClasses}</p></div></div>
          </div>
        );
      case 'students':
        return (
          <div className="space-y-6 animate-fadeIn">
            {!showStudentForm ? (<div className="flex justify-end"><button onClick={() => setShowStudentForm(true)} className="bg-[#a51a8f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-all transform hover:scale-105"><UserPlus size={20} /> Registrar Novo Aluno</button></div>) : (<div className="bg-white p-6 rounded-2xl shadow-lg border border-[#a51a8f]/20 animate-slideUp relative"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><UserPlus size={20} className="text-[#a51a8f]" /> Preencha os Dados do Novo Aluno</h3><button onClick={() => setShowStudentForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Dados do Aluno</div><div className="col-span-1 md:col-span-2 flex gap-4"><div className="flex-1"><input type="text" placeholder="Nome Completo" value={newStudentData.name} onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div><div className="flex-1"><input type="text" placeholder="URL da Foto (Opcional)" value={newStudentData.photoUrl} onChange={(e) => setNewStudentData({ ...newStudentData, photoUrl: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div></div><div className="flex gap-4"><input type="number" placeholder="Idade" value={newStudentData.age} onChange={(e) => setNewStudentData({ ...newStudentData, age: e.target.value })} className="w-1/3 border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><select value={newStudentData.gender} onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })} className="w-2/3 border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option></select></div><select value={newStudentData.schoolYear} onChange={(e) => setNewStudentData({ ...newStudentData, schoolYear: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="6Âº Ano">6Âº Ano</option><option value="7Âº Ano">7Âº Ano</option><option value="8Âº Ano">8Âº Ano</option><option value="9Âº Ano">9Âº Ano</option></select><input type="text" placeholder="WhatsApp Aluno" value={newStudentData.studentPhone} onChange={(e) => setNewStudentData({ ...newStudentData, studentPhone: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Dados do ResponsÃ¡vel</div><input type="text" placeholder="Nome ResponsÃ¡vel" value={newStudentData.parentName} onChange={(e) => setNewStudentData({ ...newStudentData, parentName: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><input type="email" placeholder="Email ResponsÃ¡vel" value={newStudentData.parentEmail} onChange={(e) => setNewStudentData({ ...newStudentData, parentEmail: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><input type="text" placeholder="WhatsApp ResponsÃ¡vel" value={newStudentData.parentPhone} onChange={(e) => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div><div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4"><button onClick={() => setShowStudentForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Cancelar</button><button onClick={handleAddStudent} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95"><Save size={18} /> Salvar Cadastro</button></div></div>)}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-4">Aluno</th><th className="p-4">CÃ³digo</th><th className="p-4">Ano</th><th className="p-4">ResponsÃ¡vel</th><th className="p-4">XP</th></tr></thead><tbody className="divide-y divide-slate-100">{students.filter(s => s.role === 'student').map(st => (<tr key={st.id} className="hover:bg-slate-50 text-sm"><td className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl overflow-hidden shrink-0">{st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.avatar}</div><div><p className="font-bold text-slate-700">{st.name}</p><p className="text-xs text-slate-400">{st.studentPhone || 'Sem cel'}</p></div></td><td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{st.userCode || 'N/A'}</span></td><td className="p-4"><span className="bg-[#fff9db] text-[#b89508] px-2 py-1 rounded text-xs font-bold border border-[#eec00a]">{st.schoolYear || '-'}</span></td><td className="p-4"><p className="text-slate-700">{st.parentName || '-'}</p><p className="text-xs text-slate-400">{st.parentPhone || '-'}</p></td><td className="p-4 font-bold text-[#a51a8f]">{st.xp}</td></tr>))}</tbody></table></div>
          </div>
        );
      case 'classes':
        return (
          <div className="space-y-6 animate-fadeIn">
            {editingClass && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-slideUp"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Edit size={20} className="text-[#a51a8f]" /> Editar / Reatribuir Aula</h3><button onClick={() => setEditingClass(null)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="text" placeholder="TÃ­tulo" value={editingClass.title} onChange={e => setEditingClass({ ...editingClass, title: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50" /><input type="text" placeholder="Data" value={editingClass.date} onChange={e => setEditingClass({ ...editingClass, date: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50" /><select value={editingClass.status} onChange={e => setEditingClass({ ...editingClass, status: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50"><option value="locked">Bloqueada</option><option value="soon">Em Breve</option><option value="live">Ao Vivo</option><option value="completed">ConcluÃ­da</option></select><div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-2"><Filter size={14} className="text-[#a51a8f]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="bg-transparent text-sm focus:outline-none w-full py-2"><option value="Todos">Todos os Anos</option><option value="6Âº Ano">6Âº Ano</option><option value="7Âº Ano">7Âº Ano</option><option value="8Âº Ano">8Âº Ano</option><option value="9Âº Ano">9Âº Ano</option></select></div><div className="col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Atribuir a:</label><div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-slate-50">{students.filter(s => s.role === 'student' && (classFilterYear === 'Todos' || s.schoolYear === classFilterYear)).map(st => (<button key={st.id} onClick={() => { const current = editingClass.assignedTo || []; if (current.includes(st.id)) setEditingClass({ ...editingClass, assignedTo: current.filter(id => id !== st.id) }); else setEditingClass({ ...editingClass, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${(editingClass.assignedTo || []).includes(st.id) ? 'bg-[#a51a8f] text-white border-[#a51a8f]' : 'bg-white text-slate-600 border-slate-300'}`}>{st.name} {st.schoolYear && <span className="opacity-70 text-[9px]">({st.schoolYear})</span>}</button>))}</div></div></div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setEditingClass(null)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100">Cancelar</button><button onClick={handleUpdateClass} className="bg-[#a51a8f] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#7d126b]">Salvar AlteraÃ§Ãµes</button></div></div></div>)}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-lg mb-4 text-slate-800">Criar Nova Aula</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="text" placeholder="TÃ­tulo da Aula" className="border rounded-xl px-4 py-2" value={newClass.title} onChange={e => setNewClass({ ...newClass, title: e.target.value })} /><input type="text" placeholder="Data (ex: 25/10 - 14:00)" className="border rounded-xl px-4 py-2" value={newClass.date} onChange={e => setNewClass({ ...newClass, date: e.target.value })} /><input type="text" placeholder="Link da Aula (Meet ou VÃ­deo)" className="border rounded-xl px-4 py-2 col-span-2" value={newClass.link} onChange={e => setNewClass({ ...newClass, link: e.target.value })} /><textarea placeholder="DescriÃ§Ã£o da aula..." className="border rounded-xl px-4 py-2 col-span-2" value={newClass.description} onChange={e => setNewClass({ ...newClass, description: e.target.value })}></textarea><div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2"><Paperclip size={16} /> Materiais de Apoio / Anexos</label><div className="flex gap-2 mb-2"><input type="text" placeholder="TÃ­tulo (ex: PDF Slides)" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={materialInput.title} onChange={e => setMaterialInput({ ...materialInput, title: e.target.value })} /><select className="border rounded-lg px-3 py-2 text-sm bg-white" value={materialInput.type} onChange={e => setMaterialInput({ ...materialInput, type: e.target.value })}><option value="pdf">PDF</option><option value="video">VÃ­deo</option><option value="link">Link</option></select></div><div className="flex gap-2 mb-3"><input type="text" placeholder="URL do Arquivo/Link" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={materialInput.url} onChange={e => setMaterialInput({ ...materialInput, url: e.target.value })} /><button onClick={handleAddMaterialToClass} className="bg-slate-700 text-white px-4 rounded-lg text-sm font-bold hover:bg-slate-800">Add</button></div>{newClass.materials.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{newClass.materials.map((mat, idx) => (<div key={idx} className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-700">{mat.type === 'pdf' ? <FileText size={14} /> : mat.type === 'video' ? <PlayCircle size={14} /> : <LinkIcon size={14} />}<span className="truncate max-w-[150px]">{mat.title}</span><button onClick={() => handleRemoveMaterialFromClass(idx)} className="text-red-400 hover:text-red-600 ml-1"><X size={14} /></button></div>))}</div>)}</div><div className="col-span-2"><div className="flex justify-between items-center mb-2"><label className="block text-sm font-bold text-slate-600">Atribuir a (Opcional - Deixe vazio para todos):</label><div className="flex items-center gap-2"><Filter size={16} className="text-[#a51a8f]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="text-sm border rounded-lg px-2 py-1 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="Todos">Todos os Anos</option><option value="6Âº Ano">6Âº Ano</option><option value="7Âº Ano">7Âº Ano</option><option value="8Âº Ano">8Âº Ano</option><option value="9Âº Ano">9Âº Ano</option></select></div></div><div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">{students.filter(s => s.role === 'student').filter(s => classFilterYear === 'Todos' || s.schoolYear === classFilterYear).map(st => (<button key={st.id} onClick={() => { const current = newClass.assignedTo; if (current.includes(st.id)) setNewClass({ ...newClass, assignedTo: current.filter(id => id !== st.id) }); else setNewClass({ ...newClass, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${newClass.assignedTo.includes(st.id) ? 'bg-[#a51a8f] text-white border-[#a51a8f] shadow-sm scale-105' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{st.name} {st.schoolYear && <span className="opacity-70 text-[9px]">({st.schoolYear})</span>}</button>))}</div></div></div><button onClick={handleAddClass} className="w-full bg-[#a51a8f] text-white py-3 rounded-xl font-bold hover:bg-[#7d126b]">Publicar Aula</button></div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Video size={18} className="text-[#a51a8f]" />Gerenciar Aulas</h3><span className="text-xs font-bold text-slate-400 uppercase">{classes.length} Aulas</span></div><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-4">CÃ³digo</th><th className="p-4">TÃ­tulo</th><th className="p-4">Criado Por</th><th className="p-4">Status</th><th className="p-4 text-right">AÃ§Ãµes</th></tr></thead><tbody className="divide-y divide-slate-100">{classes.map(cls => (<tr key={cls.id} className="hover:bg-slate-50 text-sm"><td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{cls.classCode || '-'}</span></td><td className="p-4 font-bold text-slate-700">{cls.title}</td><td className="p-4 text-slate-500 italic">{cls.createdBy || 'Sistema'}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${cls.status === 'live' ? 'bg-red-100 text-red-600' : cls.status === 'completed' ? 'bg-green-100 text-green-600' : cls.status === 'soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>{cls.status.toUpperCase()}</span></td><td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setEditingClass(cls)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit size={16} /></button><button onClick={() => handleDuplicateClass(cls)} className="p-2 text-slate-400 hover:text-[#a51a8f] hover:bg-[#fdf2fa] rounded-lg" title="Duplicar"><Copy size={16} /></button><button onClick={() => handleDeleteClass(cls.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div>
          </div>
        );
      case 'challenges':
        return (
          <div className="space-y-6 animate-fadeIn">
            {!showChallengeForm ? (
              <div className="flex justify-end"><button onClick={() => { setNewChallenge({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' }); setShowChallengeForm(true); }} className="bg-[#a51a8f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-all transform hover:scale-105"><PlusCircle size={20} /> Criar Novo Desafio</button></div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slideUp">
                <div className="bg-[#2d1b36] p-6 text-white"><div className="flex justify-between items-start mb-4"><h2 className="text-xl font-bold">{newChallenge.id ? 'Editar Desafio' : 'Criador de Desafios'}</h2><button onClick={() => setShowChallengeForm(false)} className="hover:bg-white/10 p-2 rounded-full"><X /></button></div><input type="text" placeholder="TÃ­tulo do Desafio (ex: Quiz de Verbos)" className="w-full bg-transparent text-2xl font-bold placeholder-white/40 focus:outline-none border-b border-white/20 pb-2 mb-4" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} /><div className="flex flex-wrap gap-4 mb-4"><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><span className="text-sm font-bold text-[#eec00a]">XP</span><input type="number" className="bg-transparent w-16 text-white font-mono focus:outline-none" value={newChallenge.xpReward} onChange={e => setNewChallenge({ ...newChallenge, xpReward: parseInt(e.target.value) })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Star size={14} className="text-[#eec00a] fill-[#eec00a]" /><input type="number" className="bg-transparent w-16 text-white font-mono focus:outline-none" value={newChallenge.coinReward} onChange={e => setNewChallenge({ ...newChallenge, coinReward: parseInt(e.target.value) })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Clock size={16} className="text-[#eec00a]" /><input type="datetime-local" className="bg-transparent text-white text-xs focus:outline-none" value={newChallenge.deadline} onChange={e => setNewChallenge({ ...newChallenge, deadline: e.target.value })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Clock size={16} className="text-[#eec00a]" /><input type="number" placeholder="Minutos (Opcional)" className="bg-transparent text-white text-xs focus:outline-none w-28" value={newChallenge.timeLimit} onChange={e => setNewChallenge({ ...newChallenge, timeLimit: e.target.value })} /></div></div><div className="mt-4 pt-4 border-t border-white/10"><div className="flex justify-between items-center mb-2"><label className="text-xs font-bold uppercase tracking-wider text-white/70">Atribuir a (Opcional - Vazio = Todos):</label><div className="flex items-center gap-2"><Filter size={14} className="text-[#eec00a]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="text-xs bg-white/20 border-none rounded px-2 py-1 text-white focus:outline-none"><option className="text-slate-800" value="Todos">Todos</option><option className="text-slate-800" value="6Âº Ano">6Âº Ano</option><option className="text-slate-800" value="7Âº Ano">7Âº Ano</option><option className="text-slate-800" value="8Âº Ano">8Âº Ano</option><option className="text-slate-800" value="9Âº Ano">9Âº Ano</option></select></div></div><div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">{students.filter(s => s.role === 'student' && (classFilterYear === 'Todos' || s.schoolYear === classFilterYear)).map(st => (<button key={st.id} onClick={() => { const current = newChallenge.assignedTo || []; if (current.includes(st.id)) setNewChallenge({ ...newChallenge, assignedTo: current.filter(id => id !== st.id) }); else setNewChallenge({ ...newChallenge, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${(newChallenge.assignedTo || []).includes(st.id) ? 'bg-[#eec00a] text-[#2d1b36] border-[#eec00a] font-bold' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}>{st.name}</button>))}</div></div></div>
                <div className="p-6 bg-slate-50 border-b border-slate-200">{newChallenge.questions.length === 0 ? (<p className="text-center text-slate-400 py-4">Nenhuma questÃ£o adicionada ainda.</p>) : (<div className="space-y-4">{newChallenge.questions.map((q, idx) => (<div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group"><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setNewChallenge({ ...newChallenge, questions: newChallenge.questions.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></div><div className="flex items-center gap-2 mb-2"><span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded uppercase">{q.type}</span></div><p className="font-bold text-slate-800">{idx + 1}. {q.q}</p></div>))}</div>)}</div>
                <div className="p-6"><h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">Adicionar QuestÃ£o</h4><div className="flex gap-4 mb-4"><div className="w-1/3"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo</label><div className="space-y-2"><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'multiple_choice' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'multiple_choice' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><CheckSquare size={16} /> MÃºltipla Escolha</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'true_false' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'true_false' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><Check size={16} /> Verdadeiro / Falso</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'short_answer' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'short_answer' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><Type size={16} /> Resposta Curta</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'long_answer' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'long_answer' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><AlignLeft size={16} /> Resposta Longa</button></div></div><div className="w-2/3 space-y-4"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Enunciado</label><textarea className="w-full border rounded-xl p-3 focus:border-[#a51a8f] focus:outline-none" rows={2} placeholder="Digite a pergunta aqui..." value={currentQuestion.text} onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}></textarea></div>{currentQuestion.type === 'multiple_choice' && (<div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">OpÃ§Ãµes (Marque a correta)</label>{currentQuestion.options.map((opt, idx) => (<div key={idx} className="flex gap-2 mb-2"><input type="radio" name="correctOpt" checked={currentQuestion.correctAnswer === opt && opt !== ''} onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: opt })} className="mt-2" /><input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" placeholder={`OpÃ§Ã£o ${idx + 1}`} value={opt} onChange={(e) => { const newOpts = [...currentQuestion.options]; newOpts[idx] = e.target.value; const newCorrect = currentQuestion.correctAnswer === opt ? e.target.value : currentQuestion.correctAnswer; setCurrentQuestion({ ...currentQuestion, options: newOpts, correctAnswer: newCorrect }); }} /></div>))}<button onClick={() => setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, ''] })} className="text-xs font-bold text-[#a51a8f] hover:underline mt-1">+ Adicionar OpÃ§Ã£o</button></div>)}{currentQuestion.type === 'true_false' && (<div className="flex gap-4"><button onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'Verdadeiro' })} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${currentQuestion.correctAnswer === 'Verdadeiro' ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-slate-50'}`}>Verdadeiro</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'Falso' })} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${currentQuestion.correctAnswer === 'Falso' ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-slate-50'}`}>Falso</button></div>)}{(currentQuestion.type === 'short_answer' || currentQuestion.type === 'long_answer') && (<div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">{currentQuestion.type === 'short_answer' ? 'Resposta Correta (Exata)' : 'Resposta Modelo (Opcional)'}</label><input type="text" className="w-full border rounded-xl px-4 py-2" placeholder="Digite a resposta esperada..." value={currentQuestion.correctAnswer} onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} /></div>)}<button onClick={addQuestionToChallenge} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 flex justify-center items-center gap-2"><Plus size={18} /> Adicionar QuestÃ£o ao Desafio</button></div></div></div><div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3"><button onClick={() => setShowChallengeForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200">Cancelar</button><button onClick={saveChallenge} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg">Salvar Desafio</button></div></div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Gamepad2 size={18} className="text-[#a51a8f]" />Gerenciar Desafios</h3><span className="text-xs font-bold text-slate-400 uppercase">{quizzes.length} Desafios</span></div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">TÃ­tulo</th>
                    <th className="p-4">CÃ³digo</th>
                    <th className="p-4">Criado Por</th>
                    <th className="p-4">XP</th>
                    <th className="p-4 text-right">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizzes.map(qz => (
                    <tr key={qz.id} className="hover:bg-slate-50 text-sm">
                      <td className="p-4 font-bold text-slate-700">{qz.title}</td>
                      <td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{qz.challengeCode || '-'}</span></td>
                      <td className="p-4 text-slate-500 italic">{qz.createdBy || 'Sistema'}</td>
                      <td className="p-4 text-[#a51a8f] font-bold">{qz.xpReward} XP</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditChallenge(qz)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => deleteChallenge(qz.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'financial':
        if (currentUser.role !== 'admin') return <div className="p-8 text-center text-red-500 flex flex-col items-center"><ShieldAlert size={48} className="mb-4" /> Acesso Negado: Apenas o Diretor tem acesso ao financeiro.</div>;
        return (
          <div className="bg-white p-8 rounded-2xl text-center animate-fadeIn border border-slate-200"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><DollarSign size={40} /></div><h2 className="text-2xl font-bold text-slate-800 mb-2">Painel Financeiro</h2><p className="text-slate-500 mb-8">Resumo de mensalidades e pagamentos.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"><div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-xs text-slate-400 uppercase font-bold">Faturamento Previsto</p><p className="text-2xl font-bold text-slate-800">R$ {totalRevenue},00</p></div><div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-xs text-slate-400 uppercase font-bold">InadimplÃªncia</p><p className="text-2xl font-bold text-red-500">0%</p></div></div></div>
        );
      case 'calendar':
        return <ViewCalendar classes={classes} />;
      case 'corrections':
        return <ViewCorrections students={students} />;
      default:
        return <div className="text-center py-10 text-slate-400">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 bg-[#2d1b36] text-white h-screen sticky top-0"><div className="p-6 border-b border-white/10 flex flex-col items-center justify-center"><div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl mb-3">{currentUser.avatar}</div><div className="text-center"><h1 className="font-bold text-lg text-[#eec00a]">{currentUser.name}</h1><p className="text-xs text-white/50 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Diretoria' : 'Professor'}</p></div></div><nav className="flex-1 p-4 space-y-2"><NavButton active={currentView === 'overview'} onClick={() => setCurrentView('overview')} icon={<Home />} label="VisÃ£o Geral" dark /><NavButton active={currentView === 'students'} onClick={() => setCurrentView('students')} icon={<Users />} label="Alunos" dark /><NavButton active={currentView === 'classes'} onClick={() => setCurrentView('classes')} icon={<Video />} label="GestÃ£o de Aulas" dark /><NavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 />} label="Criar Desafios" dark /><NavButton active={currentView === 'corrections'} onClick={() => setCurrentView('corrections')} icon={<FileCheck />} label="CorreÃ§Ãµes" dark />{currentUser.role === 'admin' && <NavButton active={currentView === 'financial'} onClick={() => setCurrentView('financial')} icon={<DollarSign />} label="Financeiro" dark />}<NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="Agenda" dark /></nav><div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-sm"><LogOut size={18} /> Sair</button></div></aside>
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8"><header className="md:hidden flex justify-between items-center mb-6"><div className="w-32"><LogoSVG className="w-full h-auto" /></div><button onClick={onLogout}><LogOut size={20} /></button></header><h2 className="text-2xl font-bold text-slate-800 mb-6 capitalize">{currentView === 'overview' ? 'VisÃ£o Geral' : currentView}</h2>{renderContent()}</main>
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 pb-safe"><MobileNavButton active={currentView === 'overview'} onClick={() => setCurrentView('overview')} icon={<Home size={20} />} label="Home" /><MobileNavButton active={currentView === 'students'} onClick={() => setCurrentView('students')} icon={<Users size={20} />} label="Alunos" /><MobileNavButton active={currentView === 'classes'} onClick={() => setCurrentView('classes')} icon={<Plus size={20} />} label="Add Aula" /><MobileNavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays size={20} />} label="Agenda" /></nav>
    </div>
  );
};

const StudentCard = ({ student, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center transition-all duration-300"
  >
    <div className={`
      w-28 h-28 md:w-36 md:h-36 rounded-[2rem] flex items-center justify-center text-5xl 
      shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-all duration-500
      group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-[#a51a8f]/20
      backdrop-blur-md border border-white/50 dark:border-white/10
      ${student.role !== 'student'
        ? 'bg-[#2d1b36]/90 text-white ring-2 ring-[#eec00a]/50'
        : 'bg-white/80 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-700'
      }
    `}>
      {student.photoUrl ? (
        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover z-20" />
      ) : (
        <span className="z-10 transform group-hover:scale-110 transition-transform duration-300">{student.avatar}</span>
      )}
      {student.role === 'student' && !student.photoUrl && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#a51a8f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </div>

    <div className="mt-5 flex flex-col items-center gap-1">
      <span className={`
        text-lg font-bold transition-colors duration-300
        ${student.role !== 'student'
          ? 'text-[#2d1b36] dark:text-white group-hover:text-[#a51a8f] dark:group-hover:text-[#d36ac1]'
          : 'text-slate-600 dark:text-slate-300 group-hover:text-[#a51a8f] dark:group-hover:text-white'
        }
      `}>
        {student.name}
      </span>

      {student.role !== 'student' && (
        <span className="text-[10px] uppercase font-bold text-[#a51a8f] dark:text-[#eec00a] tracking-widest bg-[#a51a8f]/5 dark:bg-[#eec00a]/10 px-2 py-1 rounded-full">
          {student.role === 'admin' ? 'Diretoria' : 'Professor'}
        </span>
      )}
    </div>
  </button>
);

// --- LOGIN WALL (USANDO O NOVO BACKGROUND ANIMADO CLARO) ---


const LoginWall = ({ onLogin }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Navigation State
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => { const setup = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); setAuthReady(true); }; setup(); }, []);
  useEffect(() => { if (!authReady) return; const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students')); const unsubscribe = onSnapshot(q, (snapshot) => { const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); data.sort((a, b) => a.name.localeCompare(b.name)); setStudents(data); }, (err) => console.error(err)); return () => unsubscribe(); }, [authReady]);

  const handleLogin = () => { if (password === selectedStudent.password) onLogin(selectedStudent); else { setError('Senha incorreta!'); setPassword(''); } };

  const getDisplayData = () => {
    let baseList = showAdminLogin ? students.filter(s => s.role !== 'student') : students.filter(s => s.role === 'student');

    // 1. Search Mode (Global Override)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return {
        mode: 'search',
        data: baseList.filter(s => s.name.toLowerCase().includes(lower))
      };
    }

    // 2. Admin Mode (Flat List)
    if (showAdminLogin) return { mode: 'flat', data: baseList };

    // 3. Class View (Specific Class)
    if (selectedClass) {
      const classStudents = baseList.filter(s => (s.schoolYear || 'Outros') === selectedClass);
      return { mode: 'class', data: classStudents, title: selectedClass };
    }

    // 4. Root View (List of Classes)
    const grouped = baseList.reduce((acc, student) => {
      const year = student.schoolYear || 'Outros';
      if (!acc[year]) acc[year] = 0;
      acc[year]++;
      return acc;
    }, {});

    // Custom sort order for school years
    const sortOrder = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Ano', '2º Ano', '3º Ano', 'Outros'];
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const idxA = sortOrder.indexOf(a);
      const idxB = sortOrder.indexOf(b);
      // If both are in the list, compare indices
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // If only A is in list, A comes first
      if (idxA !== -1) return -1;
      // If only B is in list, B comes first
      if (idxB !== -1) return 1;
      // default string sort
      return a.localeCompare(b);
    });

    return {
      mode: 'root',
      data: sortedKeys.map(k => ({ title: k, count: grouped[k] }))
    };
  };

  const displayInfo = getDisplayData();

  return (
    <BackgroundPaths>
      <SpeedInsights />
      <ThemeToggle />
      {!selectedStudent && (<button onClick={() => { setShowAdminLogin(!showAdminLogin); setSelectedStudent(null); setSelectedClass(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-[#a51a8f] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors z-20">{showAdminLogin ? 'ALUNOS' : 'ADMIN'}</button>)}

      <div className="z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 pt-16 md:pt-0">
        <div className="w-full max-w-lg mb-8 transform hover:scale-105 transition-transform duration-700">
          <LogoSVG className="w-full h-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.8)] dark:drop-shadow-xl" />
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg font-medium tracking-wide animate-fadeIn">
          {showAdminLogin ? 'Área Restrita - Selecione o Usuário' : 'Selecione seu perfil para entrar'}
        </p>

        {!selectedStudent ? (
          <div className="w-full max-w-5xl animate-slideUp flex flex-col items-center">
            {/* Search Bar - Always Visible */}
            <div className="w-full max-w-sm relative mb-10">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar seu nome..."
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a51a8f] shadow-lg transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dynamic Content Area */}
            <div className="w-full">
              {/* MODE: SEARCH or FLAT (Admin) */}
              {(displayInfo.mode === 'search' || displayInfo.mode === 'flat') && (
                <div className="space-y-4 animate-fadeIn">
                  {displayInfo.mode === 'search' && <h3 className="text-center text-slate-500 mb-4">Resultados da busca</h3>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center justify-items-center">
                    {displayInfo.data.map(student => (
                      <StudentCard key={student.id} student={student} onClick={() => setSelectedStudent(student)} />
                    ))}
                  </div>
                  {displayInfo.data.length === 0 && <p className="text-center text-slate-400">Nenhum aluno encontrado.</p>}
                </div>
              )}

              {/* MODE: ROOT (Class List) */}
              {displayInfo.mode === 'root' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mx-auto animate-slideUp">
                  {displayInfo.data.map(group => (
                    <button
                      key={group.title}
                      onClick={() => setSelectedClass(group.title)}
                      className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-105 hover:shadow-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#a51a8f]/10 dark:bg-[#a51a8f]/20 rounded-2xl flex items-center justify-center text-[#a51a8f] dark:text-[#d36ac1]">
                          <Users size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{group.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{group.count} Alunos</p>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-400 group-hover:text-[#a51a8f] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  {displayInfo.data.length === 0 && <p className="text-center text-slate-400 col-span-full">Nenhuma turma encontrada.</p>}
                </div>
              )}

              {/* MODE: CLASS (Specific Class Students) */}
              {displayInfo.mode === 'class' && (
                <div className="animate-slideUp">
                  <div className="flex items-center gap-4 mb-8">
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="flex items-center gap-2 text-slate-500 hover:text-[#a51a8f] transition-colors font-bold"
                    >
                      <ChevronLeft size={20} /> Voltar
                    </button>
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <span className="bg-[#a51a8f]/10 px-3 py-1 rounded-xl text-[#a51a8f]">{displayInfo.title}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center justify-items-center">
                    {displayInfo.data.map(student => (
                      <StudentCard key={student.id} student={student} onClick={() => setSelectedStudent(student)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!showAdminLogin && !searchTerm && !selectedClass && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => seedDatabase(auth.currentUser?.uid)}
                  className="text-xs text-slate-400 hover:text-[#a51a8f] transition-colors"
                >
                  Resetar Demo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 w-full max-w-sm mx-auto animate-fadeIn border border-white/50 dark:border-slate-700/50">
            <div className="mb-8 flex flex-col items-center">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 
                ring-4 shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300
                ${selectedStudent.role !== 'student'
                  ? 'bg-[#2d1b36] ring-[#eec00a]'
                  : 'bg-[#fdf2fa] ring-white dark:ring-slate-700'
                }
              `}>
                {selectedStudent.photoUrl ? (
                  <img src={selectedStudent.photoUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                ) : (
                  selectedStudent.avatar
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Olá, {selectedStudent.name}!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Digite sua senha para continuar</p>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={selectedStudent.role !== 'student' ? "Senha de Acesso" : "Sua senha (1234)"}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-800 dark:text-white text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:border-[#a51a8f] focus:ring-4 focus:ring-[#a51a8f]/10 mb-6 transition-all placeholder:tracking-normal placeholder:font-normal"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 text-sm mb-6 font-bold py-3 px-4 rounded-xl text-center animate-shake border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedStudent(null); setPassword(''); setError(''); }}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 py-4 rounded-2xl bg-[#a51a8f] text-white hover:bg-[#8e167b] font-bold shadow-lg shadow-[#a51a8f]/30 hover:shadow-[#a51a8f]/50 hover:-translate-y-1 transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        )}
      </div>
    </BackgroundPaths>
  );
};

// --- APP COMPONENT ---
function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRank, setShowRank] = useState(false);

  // Injetar estilos globais
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {from {opacity: 0; transform: translateY(10px); } to {opacity: 1; transform: translateY(0); } }
        @keyframes slideUp {from {opacity: 0; transform: translateY(20px); } to {opacity: 1; transform: translateY(0); } }
        .animate-fadeIn {animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp {animation: slideUp 0.3s ease-out forwards; }
        .pb-safe {padding - bottom: env(safe-area-inset-bottom); }
        `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const setupAuth = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); }
    setupAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubStudents = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students'), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubClasses = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'classes')), (snap) => { const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() })); loaded.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); setClasses(loaded); });
        const unsubQuizzes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'quizzes'), (snap) => setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        setLoading(false); return () => { unsubStudents(); unsubClasses(); unsubQuizzes(); };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => { if (currentUser) { const updatedUser = students.find(s => s.id === currentUser.id); if (updatedUser) setCurrentUser(updatedUser); } }, [students, currentUser?.id]);

  const handleCompleteQuiz = async (quizId, xpReward, coinReward) => { if (!currentUser) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', quizId), { completedBy: arrayUnion(currentUser.id) }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.id), { xp: increment(xpReward), coins: increment(coinReward), level: Math.floor((currentUser.xp + xpReward) / 500) + 1 }); };
  const handleLogout = () => { setCurrentUser(null); setCurrentView('home'); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Carregando Conecta PortuguÃªs...</div>;
  if (!currentUser) return <LoginWall onLogin={setCurrentUser} />;

  if (currentUser.role === 'admin' || currentUser.role === 'teacher') {
    return <AdminDashboard currentUser={currentUser} students={students} classes={classes} quizzes={quizzes} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col md:flex-row">
      <SpeedInsights />
      <ThemeToggle />
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0"><div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-center"><LogoSVG className="w-40 h-auto" /></div><nav className="flex-1 p-4 space-y-2"><NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home />} label="InÃ­cio" /><NavButton active={currentView === 'journey'} onClick={() => setCurrentView('journey')} icon={<BookOpen />} label="Jornada" /><NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="CalendÃ¡rio" /><NavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 />} label="Desafios" /></nav><div className="p-4 border-t border-slate-100 dark:border-slate-700"><button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-slate-700/50 rounded-xl transition-all font-medium text-sm"><LogOut size={18} /> Sair</button></div></aside>
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8"><header className="md:hidden flex justify-between items-center mb-6"><div className="w-32"><LogoSVG className="w-full h-auto" /></div><button onClick={handleLogout} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full"><LogOut size={16} className="dark:text-white" /></button></header><div className="animate-fadeIn">{currentView === 'home' && <ViewHome student={currentUser} classes={classes} onOpenRank={() => setShowRank(true)} />}{currentView === 'journey' && <ViewJourney classes={classes} />}{currentView === 'calendar' && <ViewCalendar classes={classes} />}{currentView === 'challenges' && <ViewChallenges student={currentUser} quizzes={quizzes} onCompleteQuiz={handleCompleteQuiz} />}</div></main>
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around p-3 z-50 pb-safe"><MobileNavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={20} />} label="InÃ­cio" /><MobileNavButton active={currentView === 'journey'} onClick={() => setCurrentView('journey')} icon={<BookOpen size={20} />} label="Aulas" /><MobileNavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays size={20} />} label="Agenda" /><MobileNavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 size={20} />} label="Jogar" /></nav>

      {/* RANKING MODAL / POPUP */}
      {showRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowRank(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#a51a8f] p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-[#eec00a]" /> Ranking da Turma</h3>
              <button onClick={() => setShowRank(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-4 shrink-1">
              <ViewRank students={students} currentStudentId={currentUser.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <AppContent />
    </TamaguiProvider>
  )
}
