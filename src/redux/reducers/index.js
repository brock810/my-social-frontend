
import { combineReducers } from 'redux';
import userReducer from './userReducer';
import postReducer from './postReducer';
import otherReducer from './otherReducer';

const rootReducer = combineReducers({
  user: userReducer,
  posts: postReducer,
});

export default rootReducer;
