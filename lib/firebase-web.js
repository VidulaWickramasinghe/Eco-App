const FIREBASE_APP_COMPAT = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';
const FIREBASE_AUTH_COMPAT = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAPU7msqtNr_PisMje0sKV_yeCmLu_7H04',
  authDomain: 'ecocollect-37816.firebaseapp.com',
  projectId: 'ecocollect-37816',
  storageBucket: 'ecocollect-37816.firebasestorage.app',
  messagingSenderId: '880109607741',
  appId: '1:880109607741:web:a55ff5b2c401502dd54354',
};

function getEnvConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      defaultFirebaseConfig.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error('Missing Firebase web configuration. Set NEXT_PUBLIC_FIREBASE_* values in .env.local.');
  }

  return config;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Firebase script: ${src}`));
    document.head.appendChild(script);
  });
}

async function getFirebase() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase auth can only run in the browser.');
  }

  await loadScript(FIREBASE_APP_COMPAT);
  await loadScript(FIREBASE_AUTH_COMPAT);

  const firebase = window.firebase;
  if (!firebase) {
    throw new Error('Firebase SDK failed to initialize.');
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(getEnvConfig());
  }

  return firebase;
}

export async function getFirebaseAuth() {
  const firebase = await getFirebase();
  return firebase.auth();
}

async function createRecaptchaVerifier(auth, containerId) {
  const firebase = await getFirebase();

  if (window.ecRecaptchaVerifier) {
    window.ecRecaptchaVerifier.clear();
  }

  window.ecRecaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    containerId,
    {
      size: 'invisible',
    },
    auth
  );

  await window.ecRecaptchaVerifier.render();
  return window.ecRecaptchaVerifier;
}

export async function sendFirebaseOtp(phoneE164, recaptchaContainerId = 'recaptcha-container') {
  const auth = await getFirebaseAuth();
  const recaptchaVerifier = await createRecaptchaVerifier(auth, recaptchaContainerId);

  const confirmation = await auth.signInWithPhoneNumber(phoneE164, recaptchaVerifier);
  sessionStorage.setItem('ec_phone_tmp', phoneE164);
  sessionStorage.setItem('ec_verification_id', confirmation.verificationId);

  return confirmation;
}

export async function verifyFirebaseOtp(code) {
  const firebase = await getFirebase();
  const auth = await getFirebaseAuth();
  const verificationId = sessionStorage.getItem('ec_verification_id');

  if (!verificationId) {
    throw new Error('OTP session expired. Please request a new code.');
  }

  const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
  const userCredential = await auth.signInWithCredential(credential);
  const idToken = await userCredential.user.getIdToken();

  return {
    idToken,
    phone: sessionStorage.getItem('ec_phone_tmp') || '',
  };
}
