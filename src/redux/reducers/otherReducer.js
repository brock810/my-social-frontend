// src/redux/reducers/otherReducer.js

const otherReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_OTHER_DATA':
        return action.payload;
      default:
        return state;
    }
  };
  
  export default otherReducer;
  