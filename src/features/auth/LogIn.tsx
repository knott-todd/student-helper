// Code modified: https://dev.to/nicolasmontielf/how-use-firebaseui-for-user-authentication-on-your-react-project-32h7
// FirebaseUI
import firebase from 'firebase/compat/app';

// React stuff
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// Auth service
// import auth from '../../firebase';
import React from 'react';
import { LoginForm } from './LoginForm';



export default () => {
    // useEffect(() => {
    //     const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    //     ui.start('#firebaseui-auth-container', {
    //         callbacks: {
    //             signInSuccessWithAuthResult: function(authResult, redirectUrl) {
    //                 // Action if the user is authenticated successfully
    //             },
    //             uiShown: function() {
    //                 // This is what should happen when the form is full loaded. In this example, I hide the loader element.
    //                 const loader = document.getElementById('loader');
    //                 if (loader) {
    //                     loader.style.display = 'none';
    //                 }
    //             }
    //         },
    //         signInSuccessUrl: 'localhost:3000', // This is where should redirect if the sign in is successful.
    //         signInOptions: [ // This array contains all the ways an user can authenticate in your application. For this example, is only by email.
    //             {
    //                 provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //                 requireDisplayName: true,
    //                 disableSignUp: {
    //                     status: true
    //                 }
    //             }
    //         ],
    //         tosUrl: '', // URL to you terms and conditions.
    //         privacyPolicyUrl: function() { // URL to your privacy policy
    //             window.location.assign('');
    //         }
    //     });
    // }, []);

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}