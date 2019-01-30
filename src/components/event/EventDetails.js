import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,StyleSheet,Text,TextInput,ScrollView} from 'react-native';
import {
    RkAvoidKeyboard,
    RkTextInput,
    RkButton,
    RkPicker,
    RkText
} from 'react-native-ui-kitten';
import {
    goToCreateEvent,
    goToCreateEventFromEdit,
    goToEvents,
    deleteEvents,
    getPrivilege,
    checkIn
} from '../../actions'

class EventDetails extends Component {

    componentWillMount() {
        this.props.getPrivilege();
    }

    deleteButton(eventID){
        this.props.deleteEvents(eventID);
        this.props.goToEvents();
    }
    checkinButton(ID, points){
        this.props.checkIn(ID, points);
    }
    renderButtons(){
        if(this.props.privilege !== undefined && this.props.privilege.board === true){
            return (
                <View>
                    <RkButton rkType='rounded stretch'
                        style={{backgroundColor: '#FECB00', marginTop: 10, marginBottom: 10}}
                        contentStyle={{color: 'black', fontWeight: 'bold'}}
                        onPress={this.deleteButton.bind(this,{[this.props.eventID] : null})}
                        >
                        Delete Event
                    </RkButton>
                    <RkButton rkType='rounded stretch'
                        style={{backgroundColor: '#FECB00', marginTop: 10, marginBottom: 10}}
                        contentStyle={{color: 'black', fontWeight: 'bold'}}
                        onPress={this.props.goToCreateEventFromEdit.bind(this)}
                        >
                        Edit Event
                    </RkButton>
                </View>
            )
            }else
            return(
            <View style={{paddingTop:20, paddingHorizontal:10}}>
                <RkButton rkType='rounded stretch'
                    style={{backgroundColor: '#FECB00'}}
                    contentStyle={{color: '#000', fontWeight: 'bold'}}
                    onPress={this.checkinButton.bind(this,this.props.eventID,this.props.points)}
                    >
                    Check in
                </RkButton>
            </View>
        )
    }
    render() {
            return (
                <View style={styles.formContainerStyle}>
                    <View style={styles.headerStyle}>
                        <Text style={styles.headerTextStyle}>{this.props.name}</Text>
                        {/* <Text style={styles.headerSubtitleStyle}>Registration</Text> */}
                    </View>
                    <ScrollView
                    ref={(ref)=> (this.scrollView=ref)}
                    style={styles.item}>
                    {/* <RkAvoidKeyboard> */}
                        <View>
                            <TextInput
                            rkType='rounded'
                            placeholder="Event Type"
                            value={"Type: " + this.props.type}
                            maxLength={45}
                            editable={true}
                            // onChangeText={this.onTypeChange.bind(this)}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Name"
                            value={"Name: " + this.props.name}
                            autoCapitalize="words"
                            maxLength={45}
                            // onChangeText={this.onNameChange.bind(this)}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Description"
                            value={"Description: " + this.props.description}
                            autoCapitalize="sentences"
                            maxLength={200}
                            // onChangeText={this.onDescriptionChange.bind(this)}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Date"
                            value={"Date: " + this.props.date}
                            autoCapitalize="words"
                            maxLength={45}
                            // onChangeText={this.onDateChange.bind(this)}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Time"
                            value={"Time: " + this.props.time}
                            autoCapitalize="words"
                            maxLength={45}
                            // onChangeText={this.onTimeChange.bind(this)}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Location"
                            value={"Location: " + this.props.location}
                            autoCapitalize="words"
                            maxLength={45}
                            // onChangeText={this.onLocationChange.bind(this)}
                            // onFocus={this.scrollView.scrollTo({x:100,y:100,animated: true})}
                            />
                            <TextInput
                            rkType='rounded'
                            placeholder="Value"
                            value={"Point value: " +  ((this.props.points === undefined)  ? "" : this.props.points.toString())}
                            autoCapitalize="words"
                            maxLength={45}
                            // onChangeText={this.onPointsChange.bind(this)}
                            // onFocus={this.scrollView.scrollTo({x:100,y:100,animated: true})}
                            />
                            {/* <RkPicker
                            rkType='rounded'
                            optionHeight={80}
                            optionRkType={'medium'}
                            selectedOptionRkType={'medium danger'}
                            confirmButtonText={'Select'}
                            title="Colleges"
                            titleTextRkType={'large'}
                            data={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
                            visible={this.state.pickerVisible}
                            onConfirm={this.handlePickedValueCollege}
                            onCancel={this.hidePicker1}
                            selectedOptions={this.state.collegeSelected}
                            /> */}
                        </View>
                    {/* </RkAvoidKeyboard> */}
                        {/* {this.renderError()} */}
                    </ScrollView>
                    {this.renderButtons()}
                    <RkButton rkType='rounded stretch'
                        style={{backgroundColor: '#FECB00', marginTop: 10, marginBottom: 10}}
                        contentStyle={{color: 'black', fontWeight: 'bold'}}
                        onPress={this.props.goToEvents.bind(this)}
                        >
                        Cancel
                    </RkButton>
                </View>
            )
        }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E1E1E1',
        justifyContent: 'flex-end',
    },
    formContainerStyle: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 30,
        paddingBottom: 10,
    },
    headerStyle: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        marginBottom: 10,
    },
    headerTextStyle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    errorTextStyle: {
        fontSize: 14,
        alignSelf: 'center',
        color: 'red',
        fontWeight: 'bold',
        padding: 10,
    },
    pickerTextInput: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 10,
    },
    item: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    }
});

const mapStateToProps = ({ events, auth }) => {
  const { type, name, description, date, time, location, points, eventID, error } = events;
  const { privilege } = auth;

  return { type, name, description, date, time, location, points, eventID, error, privilege };
};

const mapDispatchToProps = {
    goToCreateEvent,
    goToCreateEventFromEdit,
    goToEvents,
    deleteEvents,
    getPrivilege,
    checkIn
}


export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);