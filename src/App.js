import React, { Component } from "react";
import firebase from "firebase";
import { Actions } from "react-native-router-flux";
import Router from "./config/Router";
import AppInfo from "../app.json";
import { View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Alert } from "./components";
import { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId } from "react-native-dotenv";

console.ignoredYellowBox = ["Setting a timer"];

export default class App extends Component {
	componentDidMount() {
		const config = { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId };

		if (!firebase.apps.length)
			firebase.initializeApp(config);

		AsyncStorage.getItem("alreadyLaunched").then(alreadyLaunched => {
			Actions.splash({ verify: () => this.verifyLogIn(alreadyLaunched) });

			if (alreadyLaunched == null)
				AsyncStorage.setItem("alreadyLaunched", "true");
		});
	}

	verifyLogIn(alreadyLaunched) {
		firebase.auth().onAuthStateChanged(user => {
			let correctVersion = false;

			firebase.database().ref("/version").once("value", snapshot => {
				correctVersion = snapshot.val() === AppInfo.version;

				if (!correctVersion) {
					Actions.login();
					if (!correctVersion) Alert.alert("Please update your app");
					if (user) firebase.auth().signOut();
				}
				else if (!alreadyLaunched) {
					Actions.welcome();
				}
				else if (correctVersion && user) {
					Actions.main();
				}
				else { Actions.login({ onBack: () => console.log("custom back callback") }) }
			});
		});
	}

	render() {
		return (
			<View style = {{ flex: 1 }}>
				<Router />
				<Alert.AlertBox />
			</View>
		);
	}
}