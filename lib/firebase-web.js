const FIREBASE_APP_COMPAT = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';
const FIREBASE_AUTH_COMPAT = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js';

function getEnvConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ecocollect-37816';
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_API_KEY. Add it to .env.local for Firebase Phone Authentication.'
    );
  }

  return {
    apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
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

export async function getFirebaseAuth() {
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

  return firebase.auth();
}

export async function sendFirebaseOtp(phoneE164, recaptchaContainerId = 'recaptcha-container') {
  const auth = await getFirebaseAuth();
  const firebase = window.firebase;

  if (!window.ecRecaptchaVerifier) {
    window.ecRecaptchaVerifier = new firebase.auth.RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
  }

  const confirmation = await auth.signInWithPhoneNumber(phoneE164, window.ecRecaptchaVerifier);
  sessionStorage.setItem('ec_phone_tmp', phoneE164);
  sessionStorage.setItem('ec_verification_id', confirmation.verificationId);

  return confirmation;
}

export async function verifyFirebaseOtp(code) {
  const firebase = window.firebase;
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
