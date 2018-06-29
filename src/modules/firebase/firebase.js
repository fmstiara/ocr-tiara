import { firebaseConfig } from './config.js'
import {firebase} from '@firebase/app'
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore'
import * as firebaseui from 'firebaseui'
import $ from 'jquery'

import {socket} from '../../index'
import Synthesis from '../synthesis'
import { resolve } from 'path';

// firebase authentication
const app = firebase.initializeApp(firebaseConfig) 

// Settings for Google provider
const uiConfig = {
    callbacks: {
        signInSuccess: function(currentUser, credential, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          
          return true;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          
          document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'popup',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      // Terms of service url.
      tosUrl: '<your-tos-url>'
}

let ui = new firebaseui.auth.AuthUI(firebase.auth())

ui.disableAutoSignIn();
ui.start('#firebaseui-auth-container', uiConfig)

class StoreManager{
    constructor(_user){
        try {
            this._db = firebase.firestore()
            const settings = {
                /* your settings... */ 
                timestampsInSnapshots: true
            }
            this._db.settings(settings);
            this._users = this._db.collection('users')
            this._logs = this._db.collection('logs')
            
            
            this.registerUser(_user)
            this._displayName= _user.displayName || 'NO NAME'
            this._photoURL = _user.photoURL || ''
            this._uuid = _user.uid || 'xxxx'    

            this.listenLog()
        } catch (e){
            console.log(e);
        }
    }

    registerUser(_user){
        if(_user){
            if(_user.uid){
                this._users.doc('u'+_user.uid).set(_user)
            }
        }
    }

    createContent(_text){
        return new Promise((resolve, reject)=>{
            const d = new Date()
            const ts = d.getTime()
            const year = d.getFullYear()
            const month = d.getMonth()
            const day = d.getDay()
            const hour = d.getHours()
            let minute = d.getMinutes()
            if(minute <= 9){
                minute = '0'+minute
            }
            let second = d.getSeconds()
            if(second <= 9){
                second = '0'+second
            }

            const res = {
                ts: ts,
                uuid: this._uuid,
                text: _text,
                user_name: this._displayName,
                user_photo: this._photoURL,
                time: hour+':'+minute+':'+second,
                date: `${year}/${month}/${day}`
            }
            resolve(res)
        })
    }

    listenLog(){
        this._logs.onSnapshot((snapshot)=>{
            const logs = []

            snapshot.forEach((doc)=>{
                logs.unshift(doc.data())
            })
            addLogDOM(logs)
        })
    }

    getUserInfo(){
        return this._users.doc('u'+this._uuid).get()
    }
}

const addLogDOM = function(_logs){
    const $lists = $('#recognized-text-list')
    $lists.empty()
    _logs.forEach((e)=>{
        // ログのエレメント
        let $list = $('<div>', {
            class: 'row p-2 mb-3 border-bottom'
        })

        let $image = $('<div>', {
            class: 'col-1 log-image-area'
        })
    
        let $i = $('<img>', {
            class: 'img-fluid rounded m-1',
            alt: 'NO IMAGE',
            src: e.user_photo
        })
        $image.append($i)


        let $content = $('<div>', {
            class: 'col-11'
        })

        // user name & timestamps
        let $info = $('<div>', {
            class: 'd-flex w-100 justify-content-between'
        })
        let $head = $('<strong>', {
            class: 'mb-1',
            text: e.user_name
        })
        let $time = $('<small>' , {
            class: 'mb-1',
            text: e.time
        })
        $info.append([$head, $time])
        
        // text
        let $text = $('<p>', {
            class: 'mb-3',
            text: e.text
        })

        let $translated = $('<p>', {
            class: 'mb-1 text-muted',
            text: e.translated
        })

        $content.append([$info, $text, $translated])
        $list.append([$image, $content])
        $lists.append($list)
    })
    
}

export let storeManager = ''

export const authInit = function(){
    firebase.auth().onAuthStateChanged((user)=>{
        if(user){
            // user is signed in.
            const displayName = user.displayName
            const email = user.email
            const emailVerified = user.emailVerified
            const photoURL = user.photoURL
            const uid = user.uid
            const phoneNumber = user.phoneNumber
            const providerData = user.providerData
            // console.log(providerData);
            
            user.getIdToken().then((accessToken)=>{
                const u = {
                    displayName: displayName,
                    email: email,
                    emailVerified: emailVerified,
                    phoneNumber: phoneNumber,
                    photoURL: photoURL,
                    uid: uid,
                    accessToken: accessToken
                }

                storeManager = new StoreManager(u)

                document.getElementById('firebaseui-auth-container').style.display = 'none';
                // document.getElementById('user-img').src = photoURL
                // document.getElementById('user-name').innerText = displayName

                socket.emit('req/login', u)
            })
        } else {
            // user is signed out.
            console.log(`user is signed out.`);
            
        }
        
    }, (error)=>{
        console.log(error);
    })
}


