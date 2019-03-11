import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import _ from 'lodash';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  FlatList,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions } from 'react-native';
import { Button } from '../components/general'
import {
    openElection,
    closeElection,
    deletePosition,
    goToPositionForm,
    getPositions,
    positionDescriptionChanged,
    positionTitleChanged
} from '../actions'

const dimension = Dimensions.get('window');

class ElectionPosition extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
      this.props.getPositions();
  }

  state = {
    data: (_.toArray(this.props.positions)).map((d, index) => ({
      position: d,
      key: `item-${index}`,
      label: index,
      backgroundColor: '#fff',
    }))
  }


  openOrClose(){
      if(this.props.election){
        return (
        <Button
        onPress={() => this.props.closeElection()}
        title={"CLOSE ELECTION"}
        >
        </Button>
        )
      }
      else
      return (
        <Button
        onPress={() => this.props.openElection()}
        title={"OPEN ELECTION"}
        >
        </Button>
        )
  }

  renderPositions({ item, index, move, moveEnd, isActive }) {
    const {
      containerStyle,
      contentContainerStyle,
    } = styles;

    const color = (isActive) ? {backgroundColor: '#ffd700'} : {backgroundColor: item.backgroundColor}
    return (
      <TouchableOpacity
        style={[contentContainerStyle, color]}
        onLongPress={move}
        onPressOut={moveEnd}>
        <View style={containerStyle}>
          <Text>{`${(item.position).title}`}</Text>
        </View>
      </TouchableOpacity>
    )
  }


  renderFlatlist(positions){
    return(
      <View style={{ flex: 1 }}>
      <DraggableFlatList
          data={this.state.data}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          renderItem={this.renderPositions}
          scrollPercent={5}
          onMoveEnd={({ data }) => this.setState({ data })}
      />
      </View>
    )
  }

  /*viewPosition(item) {
    this.props.positionTitleChanged(item.title);
    this.props.positionDescriptionChanged(item.description);
    this.props.goToPositionForm("EDIT");
  }*/

  render() {
    const {
        tabBar,
        tabBarText,
        content,
        buttonContainerStyling,
        page,
        containerStyle,
        contentContainerStyle,
    } = styles;

    const {
      positions,
    } = this.props;

    const positionsArray = _.toArray(positions)


    return (
     <View style={page}>
        <View style={tabBar}>
            <Text style={tabBarText}>Positions</Text>
        </View>

        {this.renderFlatlist(positionsArray)}

         <View style={buttonContainerStyling}>
            <Button
            onPress={() => {this.props.positionTitleChanged("");
            this.props.positionDescriptionChanged("");
            this.props.goToPositionForm("ADD");}}
            title={"ADD POSITIONS"}
            >
            </Button>
        </View>
        <View style={buttonContainerStyling}>
            <Button
            onPress={() => Actions.ElectionBackEnd()}
            title={"BACK"}
            >
            </Button>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  tabBar : {
    height: dimension.height * .1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#0005",
  },
  containerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',

    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  containerTextStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#ffd700',

    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  contentContainerStyle: {
    margin: 1,
    height: dimension.height * .09,
  },
  tabBarText : {
    color: '#000',
    fontSize: 20,
    margin: 20,
    alignSelf: "center"
  },
  content: {
    flex: 1,
    margin: 10
  },
  buttonContainerStyle: {
      flex: 5,
      margin: 5
  },
  page: {
    flex: 1,
    backgroundColor: '#ebebf1',
  }
});

const mapStateToProps = ({ elect }) => {
    const { election, positions } = elect

    return { election, positions };
};

const mapDispatchToProps = {
    openElection,
    closeElection,
    deletePosition,
    goToPositionForm,
    getPositions,
    positionDescriptionChanged,
    positionTitleChanged
};

export default connect(mapStateToProps, mapDispatchToProps)(ElectionPosition);
