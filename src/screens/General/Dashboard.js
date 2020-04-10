import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Spinner } from "../../components/general";
import { Actions } from "react-native-router-flux";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Flag from "react-native-flags";
import { ColorPicker } from "react-native-color-picker";
import { RenderFlags, CustomFlag } from "../../utils/flag";
import Ionicons from "react-native-vector-icons/Ionicons";
import { rankMembers } from "../../utils/render";
import { months } from "../../data/DateItems";
import {
	Text,
	View,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Linking,
	Modal,
	SafeAreaView,
	StatusBar
} from "react-native";
import {
	loadUser,
	pageLoad,
	fetchMembersPoints,
	fetchEvents,
	getPrivilege,
	typeChanged,
	committeeChanged,
	nameChanged,
	descriptionChanged,
	dateChanged,
	startTimeChanged,
	endTimeChanged,
	locationChanged,
	epointsChanged,
	eventIDChanged,
	goToViewEvent,
	getCommittees,
	setDashColor,
	setFlag,
	fetchAllUsers,
	getUserCommittees,
	loadCommittee,
	changeUserCommittees,
	updateElection
} from "../../ducks";

const dimension = Dimensions.get("window");
const iteratees = ["points", "lastName", "firstName"];
const order = ["desc", "asc", "asc"];

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			colorPickerVisible: false,
			flagsVisible: false,
			customFlagVisible: false,
			customFlagText: ""
		};
	}

	didBlurSubscription = this.props.navigation.addListener("didBlur",
		() => { this.setState({ refresh: true }) }
	);

	componentDidMount() {
		this.props.pageLoad();
		this.props.updateElection();
		this.props.getCommittees();
		this.props.fetchMembersPoints();
		this.props.fetchEvents();
		this.props.getPrivilege();
		this.props.loadUser();
		this.props.fetchAllUsers();
	}

	render() {
		return this.props.loading ? <Spinner /> : this.renderContent();
	}

	renderContent() {
		const {
			page,
			title,
			textColor,
			dashCommitteesContainer,
			innerScrollContainer,
			dashboardContent,
			upcomingEventsContainer
		} = styles;

		const {
			customFlagVisible,
			customFlagText,
			flagsVisible
		} = this.state;

		return (
			<SafeAreaView style = { page }>
				<StatusBar backgroundColor = "#0c0b0b" barStyle = "light-content" />
				{ this.renderColorPicker() }
				<ScrollView>
					<View style = { innerScrollContainer }>
						{ this.renderHeader() }
						<View style = { dashboardContent }>
							<View style = { upcomingEventsContainer }>
								<Text style = { [title, textColor] }>Upcoming Events</Text>
							</View>
							{ this.getFormattedEventList() }
							<View style = { dashCommitteesContainer }>
								{ this.renderLeaderboard() }
								{ this.renderCommitteePanel() }
							</View>
						</View>
						{ this.renderButtonLinks() }
					</View>
				</ScrollView>
				<RenderFlags
					flagsVisible = { flagsVisible }
					changeVisibility = { (val) => this.setState({ flagsVisible: val }) }
					flagPicked = { (text) => this.flagPicked(text) }
				/>
				<CustomFlag
					customFlagVisible = { customFlagVisible }
					customFlagText = { customFlagText }
					changeText = { (text) => this.setState({ customFlagText: text }) }
					changeVisibility = { (val) => this.setState({ customFlagVisible: val }) }
					flagPicked = { (text) => this.flagPicked(text) }
				/>
			</SafeAreaView>
		);
	}

	renderHeader() {
		const {
			headerContainer,
			headerOptionsContainer
		} = styles;

		let dashColor = { backgroundColor: this.props.dashColor };
		let chevronColor = { color: "white" };

		return (
			<View style = { [headerContainer, dashColor ] }>
				{ this.renderGreeting() }
				<View style = { headerOptionsContainer }>
					{ this.renderHeaderFlag() }
					<FontAwesomeIcon
						style = { chevronColor }
						name = "chevron-down"
						onPress = { () => this.setState({ colorPickerVisible: true }) }
						size = { 15 }
					/>
				</View>
			</View>
		);
	}

	renderGreeting() {
		const {
			textColor,
			greetingContainer
		} = styles;

		const date = new Date();
		let time = date.getHours();
		let day = date.getDate();
		let month = date.getMonth();
		let greeting = time >= 12 ? "Good evening" : "Good morning";

		return (
			<View style = { greetingContainer }>
				<Text style = { [textColor, { fontSize: 20 }] }>{ greeting }, { this.props.firstName }.</Text>
				<Text style = { textColor }>Today is { months[month] } { day }</Text>
			</View>
		);
	}

	renderHeaderFlag() {
		return (
			<TouchableOpacity onPress = { () => this.setState({ flagsVisible: !this.state.flagsVisible }) } >
				<Flag
					type = "flat"
					code = { this.props.flag }
					size = { 32 }
				/>
			</TouchableOpacity>
		);
	}

	 flagPicked(flag) {
		if (flag === "") {
			this.setState({ flagsVisible: false, customFlagVisible: true });
		}
		else {
			this.props.setFlag(flag);
			this.setState({ flagsVisible: false });
		}
	}

	renderColorPicker() {
		let modalColor = { backgroundColor: "transparent" };
		let pickerColor = { backgroundColor: "black" };

		return (
			<Modal visible = { this.state.colorPickerVisible } transparent = { true }>
				<View style = { [styles.modalBackground, modalColor] }>
					<ColorPicker
						defaultColor = "#21252b"
						oldColor = { this.props.dashColor }
						onColorSelected = { color => this.colorPicked(color) }
						style = { [styles.modalContent, pickerColor] }
					/>
				</View>
			</Modal>
		);
	}

	colorPicked(color) {
		this.props.setDashColor(color);
		this.setState({ colorPickerVisible: false });
	}

	renderLeaderboard() {
		const {
			title,
			leaderboardContent,
			textColor,
			indexText,
			index,
			leaderboardContainer,
			leaderboardContentDivider,
			leaderboardDividerLine,
			leaderboardArrow,
			gold
		} = styles;

		let memberObj = this.calculateRankings();

		const {
			sortedMembers,
			currentMember
		} = memberObj;

		if (!currentMember) return null;

		return (
			<TouchableOpacity style = { leaderboardContainer } onPress = { () => Actions.LeaderboardD() }>
				<View style = { leaderboardContent }>
					<Text style = { [title, textColor] }>Top Member</Text>
					<Text style = { textColor }>{ sortedMembers[0].firstName } { sortedMembers[0].lastName }</Text>
				</View>
				<View style = { leaderboardContentDivider }>
					<View style = { leaderboardDividerLine }></View>
					<View style = { leaderboardArrow }>
						<Ionicons
							name = "ios-arrow-dropright"
							size = { dimension.height * 0.025 }
							style = { gold }
						/>
					</View>
					<View style = { leaderboardDividerLine }></View>
				</View>
				<View style = { leaderboardContent }>
					<Text style = { [title, textColor] }>Your Ranking</Text>
					<View style = { index }>
						<Text style = { indexText }>{ currentMember.index }</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	renderCommitteePanel() {
		const {
			committeeItemContainer,
			textColor,
			committeesPanelContainer,
			committeesListContainer,
			selectCommitteesIcon,
			committeeNameContainer,
			leaderboardArrow,
			committeesPlaceHolder,
			gold
		} = styles;

		const {
			committeesList,
			changeUserCommittees,
			userCommittees
		} = this.props;

		let content = null;
		let committeesArray = null;

		if (!this.props.userCommittees || !committeesList) {
			content = <View style = { committeesPlaceHolder }>
				<View>
					<Text style = { [textColor, { fontSize: dimension.width * 0.03 }] }>Add your main committees!</Text>
				</View>
			</View>;
		}

		else {
			committeesArray = Object.entries(userCommittees);

			committeesArray.forEach(function(element) {
				if (!committeesList[element[0]]) {
					let committee = element[0];
					changeUserCommittees({ [committee]: null });
				}
			});

			content = <View style = { committeesListContainer }>
				{ Object.values(committeesArray).map(item =>
					<TouchableOpacity
						style = { committeeItemContainer }
						onPress = { () => { this.viewCommittee(committeesList[item[0]]) } }
					>
						<View style = { committeeNameContainer }>
							<Text style = { [textColor, { fontSize: dimension.width * 0.03 }] }>{ item[0] }</Text>
						</View>
						<View style = { leaderboardArrow }>
							<Ionicons
								name = "ios-arrow-dropright"
								size = { dimension.height * 0.025 }
								style = { gold }
							/>
						</View>
					</TouchableOpacity>
				) }
			</View>;
		}

		return (
			<View style = { committeesPanelContainer }>
				<View style = { selectCommitteesIcon }>
					<Ionicons
						name = "ios-information-circle"
						size = { dimension.height * 0.028 }
						onPress = { () => Actions["CommitteesD"]({ screen: "dashboard" }) } style = { gold }
					/>
				</View>
				{ content }
			</View>
		);
	}

	viewCommittee(item) {
		this.props.loadCommittee(item);
		Actions["CommitteePageD"]({ screen: "dashboard" });
	}

	renderButtonLinks() {
		const {
			socialMediaButton,
			socialMediaContainer,
			buttonRowContainer,
			black
		} = styles;

		let buttonLinks = [
			["https://shpeucf2018-2019.slack.com/", "slack"],
			["https://www.facebook.com/shpeucfchapter/", "facebook"],
			["https://www.shpeucf.com/", "globe"],
			["https://www.instagram.com/shpeucf/?hl=en", "instagram"]
		];

		return (
			<View style = { socialMediaContainer }>
				<View style = { buttonRowContainer }>
					{ buttonLinks.map(data =>
						<TouchableOpacity
							style = { socialMediaButton }
							onPress = { () => Linking.openURL(data[0]) }
						>
							<FontAwesomeIcon
								style = { black }
								name = { data[1] }
								size = { dimension.height * 0.04 }
							/>
						</TouchableOpacity>
					) }
				</View>
				{ this.renderFooter() }
			</View>
		);
	}

	renderFooter() {
		const {
			footer,
			footerText,
			black,
			textColor
		} = styles;

		return (
			<View style = { footer }>
				<View style = { footerText }>
					<Text style = { black }>SHPE </Text>
					<Text style = { textColor }>UCF</Text>
				</View>
			</View>
		);
	}

	calculateRankings() {
		let sortedMembers = _.orderBy(this.props.membersPoints, iteratees, order);
		let currentMember = rankMembers(sortedMembers, this.props.id);
		sortedMembers.splice(2);

		if (this.isDefined(currentMember)
			&& this.isDefined(sortedMembers)
			&& sortedMembers[0].id !== currentMember.id
			&& sortedMembers[1].id !== currentMember.id
		)	sortedMembers[1] = currentMember;

		return { sortedMembers, currentMember } ;
	}

	convertNumToDate(date) {
		let months = ["Jan", "Feb", "Mar", "April", "May", "June",
			"July", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let tempDate = date.split("-");

		return `${months[Number(tempDate[1]) - 1]} ${tempDate[2]}`;
	}

	viewEvent(item) {
		this.props.typeChanged(item.type);
		this.props.committeeChanged(item.committee);
		this.props.nameChanged(item.name);
		this.props.descriptionChanged(item.description);
		this.props.dateChanged(item.date);
		this.props.startTimeChanged(item.startTime);
		this.props.endTimeChanged(item.endTime);
		this.props.locationChanged(item.location);
		this.props.epointsChanged(item.points);
		this.props.eventIDChanged(item.eventID);
		this.props.goToViewEvent("dashboard");
	}

	convertHour(time) {
		let hour;
		let array = time.split(":");

		if (array[2] === "AM") {
			hour = "" + parseInt(array[0]);
			if (hour === "0") hour = "12";

			return hour + ":" + array[1] + ":" + array[2];
		}

		hour = "" + (parseInt(array[0]) - 12);
		if (hour === "0") hour = "12";

		return hour + ":" + array[1] + ":" + array[2];
	}

	sortEvents(eventList) {
		let thisdate = new Date();
		let month = thisdate.getMonth() + 1;
		let year = thisdate.getFullYear();
		let day = thisdate.getDate();
		let hour = thisdate.getHours();
		let min = thisdate.getMinutes();
		let events = {};

		Object.keys(eventList).forEach(function(element) {
			let eventObj = eventList[element];
			let endTime = eventObj.endTime.split(":");
			let tempDate = eventObj.date.split("-");

			if (tempDate[0] < year) return;
			if (tempDate[1] < month) return;
			if (tempDate[2] < day) return;
			if (tempDate[2] == day)
				if (endTime[0] < hour) return;
				else if (endTime[0] == hour)
					if (endTime[1] < min) return;

			Object.assign(eventObj, { eventID: element });
			Object.assign(events, { [element]: eventObj });
		});

		let sortedEvents = _.orderBy(events, ["date", "startTime", "endTime"], ["asc", "asc", "asc"]);

		return sortedEvents;
	}

	showEvents(event) {
		const {
			leaderboardArrow,
			eventTextContainer,
			eventItemInnerContainer,
			eventTextStyle,
			gold
		} = styles;

		const {
			name,
			date,
			committee,
			startTime,
			endTime,
			type
		} = event;

		if (!event) return null;

		let viewType = type;
		let realStart = this.convertHour(startTime);
		let realEnd = this.convertHour(endTime);

		if (committee) viewType = committee;

		return (
			<View style = { eventItemInnerContainer }>
				<View style = { eventTextContainer }>
					<Text style = { eventTextStyle }>{ viewType }: { name }</Text>
					<Text style = { eventTextStyle }>
						{ this.convertNumToDate(date) } - { realStart } - { realEnd }
					</Text>
				</View>
				<View style = { leaderboardArrow }>
					<Ionicons
						name = "ios-arrow-dropright"
						size = { dimension.height * 0.025 }
						style = { gold } />
				</View>
			</View>
		);
	}

	getFormattedEventList() {
		const {
			textColor,
			eventListContainerFull,
			eventEmptyText,
			eventsItem
		} = styles;

		let recentEvents = [];
		let singleContainer = {};
		let events = [];
		let content = null;

		if (this.props.eventList) events = this.sortEvents(this.props.eventList);
		recentEvents = events.slice(0, 3);

		if (events.length < 2) singleContainer.flex = 0.4;

		if (events.length === 0) content = <Text style = { [textColor, eventEmptyText ] }>No Upcoming Events</Text>;

		else content = recentEvents.map(item =>
			<TouchableOpacity onPress = { () => this.viewEvent(item) } style = { eventsItem }>
				{ this.showEvents(item) }
			</TouchableOpacity>
		);

		return (
			<View style = { [eventListContainerFull, singleContainer] }>
				{ content }
			</View>
		);
	}

	isDefined(obj) {
		return !(!obj || obj.length < 2);
	}
}

const styles = {
	page: {
		flex: 1,
		backgroundColor: "#0c0b0b"
	},
	eventListContainerFull: {
		backgroundColor: "#21252b",
		borderColor: "white",
		flex: 0.8
	},
	eventEmptyText: {
		fontSize: 20,
		textAlign: "center",
		padding: 20
	},
	eventsItem: {
		backgroundColor: "#21252b",
		flex: 1,
		borderBottomWidth: 5
	},
	eventItemInnerContainer: {
		flexDirection: "row",
		flex: 1,
		alignItems: "center",
		paddingRight: 20
	},
	eventTextContainer: {
		flex: 1,
		alignItems: "flex-start",
		paddingLeft: 20
	},
	headerContainer: {
		paddingLeft: "4%",
		justifyContent: "center",
		flex: 0.16,
		flexDirection: "row"
	},
	greetingContainer: {
		flex: 1,
		justifyContent: "center"
	},
	textColor: {
		color: "#e0e6ed"
	},
	socialMediaButton: {
		alignItems: "center",
		justifyContent: "space-evenly",
		backgroundColor: "#FECB00",
		width: dimension.height * 0.07,
		height: dimension.height * 0.07,
		borderRadius: 15,
		paddingBottom: "2%",
		marginBottom: "2%",
		marginLeft: "2%",
		marginRight: "2%"
	},
	mainContentStyle: {
		backgroundColor: "black",
		flexDirection: "column",
		flex: 1
	},
	title: {
		fontSize: 18,
		fontWeight: "500"
	},
	leaderboardContainer: {
		backgroundColor: "#21252b",
		flex: 1,
		marginRight: 5
	},
	leaderboardContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "space-evenly"
	},
	leaderboardContentDivider: {
		flex: 0.3,
		alignSelf: "center",
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around"
	 },
	leaderboardDividerLine: { flex: 0.45,
		height: dimension.height * 0.003,
		backgroundColor: "black"
	},
	leaderboardArrow: {
		color: "#FECB00",
		width: dimension.width * 0.06,
		alignItems: "center"
	},
	modalBackground: {
		justifyContent: "center",
		alignItems: "center",
		margin: 0,
		height: dimension.height,
		width: dimension.width,
		backgroundColor: "#000a"
	},
	modalContent: {
		height: "50%",
		width: "80%",
		padding: 10,
		backgroundColor: "#21252b"
	},
	committeesPanelContainer: {
		flexDirection: "row",
		flex: 1,
		height: "100%",
		backgroundColor: "#21252b",
		alignItems: "center",
		marginLeft: 5
	},
	committeesListContainer: {
		flex: 1,
		height: "80%"
	},
	committeesPlaceHolder: {
		flex: 1,
		 justifyContent: "space-evenly",
		 height: "80%"
	},
	selectCommitteesIcon: { height: "100%",
		alignItems: "center",
		flex: 0.25,
		paddingTop: "5%"
	},
	committeeItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		paddingRight: 20
	},
	committeeNameContainer: {
		flex: 1,
		alignItems: "flex-start",
		justifyContent: "space-evenly"
	},
	index: {
		color: "#000",
		borderColor: "#FECB00",
		backgroundColor: "#FECB00",
		borderStyle: "solid",
		borderRadius: dimension.height * 0.05 * 0.5,
		justifyContent: "center",
		alignItems: "center",
		height: dimension.height * 0.05,
		width: dimension.height * 0.05
	},
	indexText: {
		fontWeight: "700",
		fontSize: 20,
		color: "black"
	},
	socialMediaContainer: {
		flex: 0.35,
		alignItems: "center"
	},
	buttonRowContainer: {
		flexDirection: "row",
		flex: 1,
		alignItems: "center"
	},
	footer: { flex: 0.2,
		justifyContent: "center",
		backgroundColor: "#FECB00",
		width: "100%"
	},
	footerText: {
		flexDirection: "row",
		justifyContent: "center"
	},
	eventsContainer: {
		flex: 1,
		flexDirection: "column"
	},
	eventTextStyle: {
		color: "white",
		fontSize: dimension.width * 0.035
	},
	containerTextStyle: {
		flex: 3,
		justifyContent: "center",
		alignItems: "flex-start",
		paddingVertical: 10,
		paddingHorizontal: 15
	},
	dashCommitteesContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		flex: 0.9,
		paddingTop: 10
	},
	innerScrollContainer: {
		height: dimension.height * 1.3
	},
	dashboardContent: {
		flex: 1,
		paddingLeft: "5%",
		paddingRight: "5%"
	},
	headerOptionsContainer: {
		justifyContent: "space-evenly",
		alignItems: "center",
		paddingLeft: "2%",
		paddingRight: "2%"
	},
	gold: {
		color: "#FECB00"
	},
	black: {
		color: "black"
	},
	upcomingEventsContainer: {
		alignItems: "center",
		flex: 0.2,
		justifyContent: "center",
		padding: 20
	}
};

const mapStateToProps = ({ user, general, members, events, elect, committees }) => {
	const {
		firstName,
		id,
		dashColor,
		flag,
		userCommittees
	} = user;
	const {
		loading
	} = general;
	const {
		membersPoints
	} = members;
	const {
		eventList
	} = events;
	const {
		election
	} = elect;
	const {
		committeesList
	} = committees;

	return {
		firstName,
		id,
		loading,
		membersPoints,
		eventList,
		election,
		dashColor,
		committeesList,
		flag,
		userCommittees
	};
};

const mapDispatchToProps = {
	loadUser,
	pageLoad,
	fetchMembersPoints,
	fetchEvents,
	getPrivilege,
	typeChanged,
	committeeChanged,
	nameChanged,
	descriptionChanged,
	dateChanged,
	startTimeChanged,
	endTimeChanged,
	locationChanged,
	epointsChanged,
	eventIDChanged,
	goToViewEvent,
	getCommittees,
	setDashColor,
	setFlag,
	fetchAllUsers,
	getUserCommittees,
	loadCommittee,
	changeUserCommittees,
	updateElection
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);