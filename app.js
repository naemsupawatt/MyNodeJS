const express = require('express');
const app = express();
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
var cron = require('node-cron');
const axios = require('axios');


let PORT = process.env.PORT || 3000;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://flutter-realtime-databas-baf14-default-rtdb.firebaseio.com"
});
const db = admin.firestore();
let userCollection = db.collection('Users');
let notifyCollection = db.collection('collectionNotify');

app.get('/', async (req, res) => {

    // const snapshot = await userCollection.get();
    // snapshot.forEach(async(doc) => {
    //     console.log(doc.id, '=>', doc.data());
    //     console.log(doc.id);
    //     const Notifysnapshot = await notifyCollection.where('UserID','==',doc.id).get();
    //     // console.log(notifyCollection._materializedDocs);
    //     if (Notifysnapshot.empty) {
    //         console.log('No matching documents.');
    //         return;
    //       }  
    //       Notifysnapshot.forEach(doc => {
    //         console.log(doc.id, '=>', doc.data());
    //       });
    // });

    // res.send(snapshot._materializedDocs);
    res.send("Hello wrold");

});

cron.schedule('* * * * *', async function () {
    // console.log('running a task every minute');
    getNotify();

    // makeGetRequest();


}, { timezone: "Asia/Bangkok" });

let getNotify = async () => {
    let date = new Date;
    var minutes = date.getMinutes();
    var hour = date.getHours();
    var days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    var day = days[date.getDay()];
    const snapshot = await userCollection.get();
    snapshot.forEach(async (doc) => {
        // console.log(doc.id, '=>', doc.data());
        // console.log(doc.id);
        let UserData = doc.data();
        let tokenNotify = UserData.tokenNotify;

        const Notifysnapshot = await notifyCollection.where('UserID', '==', doc.id).get();
        // console.log(notifyCollection._materializedDocs);
        if (Notifysnapshot.empty) {
            console.log('No matching documents.');
            return;
        }
        Notifysnapshot.forEach(async (doc) => {
            console.log(doc.id, '=>', doc.data());
            let notifyData = doc.data();
            // console.log(notifyData.Minute);
            if (notifyData.Hour === hour && notifyData.Minute === minutes && notifyData.Day === day) {
                console.log("test");
                console.log(hour);
                console.log(minutes);
                console.log(day);
                await axios.post('https://fcm.googleapis.com/fcm/send', {
                    "to": tokenNotify,
                    "notification": {
                        "title": notifyData.Name,
                        "body": notifyData.Text
                    },
                    "data": { "message": "test" }
                }, {
                    headers: {
                        // 'application/json' is the modern content-type for JSON, but some
                        // older servers may use 'text/json'.
                        'Authorization': 'key=AAAAIDSa6GU:APA91bEwWV2cVq2RcJrb_Y8aTex7Bfvq9qvq6htFr8r4TGQG7DK4bSrXyqjPOcimkGnu5J7FEqO2Wwab2xwGWiQRj2UA8qEwywfpWa49K3koGGxRd-IPpv0VzQ7xpBRN1MIA-G7F095d',
                        'content-type': 'application/json'
                    }
                });
            }
        });
    });
}

// setInterval(getNotify, 1000);


app.listen(PORT, () => {
    console.log(`Server started on port 3000`);
});

