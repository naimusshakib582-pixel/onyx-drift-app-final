import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

class WebSocketService {
    constructor() {
        // রেন্ডার সার্ভারের সঠিক সকেট এন্ডপয়েন্ট
        this.socketUrl = "https://onyx-drift-api-server.onrender.com/ws";
        this.stompClient = null;
    }

    connect() {
        // যদি অলরেডি কানেক্টেড থাকে তবে নতুন করে করার দরকার নেই
        if (this.stompClient && this.stompClient.connected) return;

        const socket = new SockJS(this.socketUrl);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = () => {}; // কনসোলে অপ্রয়োজনীয় লগ বন্ধ রাখবে

        this.stompClient.connect({}, (frame) => {
            console.log("Connected to Onyx Neural Core");
        }, (err) => {
            console.error("Neural Link Error:", err);
            // কানেকশন লস্ট হলে ৫ সেকেন্ড পর আবার চেষ্টা করবে
            setTimeout(() => this.connect(), 5000);
        });
    }

    subscribe(topic, callback) {
        if (this.stompClient && this.stompClient.connected) {
            return this.stompClient.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
        }
        return null;
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            console.log("Disconnected from Neural Core");
        }
    }
}

export default new WebSocketService();