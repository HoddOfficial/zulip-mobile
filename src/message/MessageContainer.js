/* @flow */
import React, { PureComponent } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type { Actions, Auth, SubscriptionsState, Narrow, Message } from '../types';
import MessageFull from './MessageFull';
import MessageBrief from './MessageBrief';
import {
  getAuth,
  getFlags,
  getSubscriptions,
  getCurrentRoute,
  getActiveNarrow,
} from '../selectors';
import connectWithActions from '../connectWithActions';
import { constructActionButtons, executeActionSheetAction } from './messageActionSheet';
import type { ShowActionSheetTypes } from './messageActionSheet';

type Props = {
  actions: Actions,
  currentRoute: string,
  message: Object,
  narrow: Narrow,
  subscriptions: SubscriptionsState,
  auth: Auth,
  flags: Object,
  twentyFourHourTime: boolean,
  isBrief: boolean,
  onReplySelect?: () => void,
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

class MessageContainer extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    intl: () => null,
  };

  static defaultProps = {
    twentyFourHourTime: false,
  };

  isStarred(message: Message) {
    const { flags } = this.props;
    return message.id in flags.starred;
  }

  showActionSheet = ({ options, cancelButtonIndex, callback }: ShowActionSheetTypes) => {
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      callback,
    );
  };

  handleLongPress = () => {
    const {
      actions,
      auth,
      narrow,
      subscriptions,
      flags,
      message,
      currentRoute,
      onReplySelect,
    } = this.props;
    const getString = value => this.context.intl.formatMessage({ id: value });
    const options = constructActionButtons({
      message,
      auth,
      narrow,
      flags,
      currentRoute,
      getString,
    });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        actions,
        auth,
        subscriptions,
        currentRoute,
        onReplySelect,
        getString,
      });
    };

    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
  };

  render() {
    const { message, auth, actions, twentyFourHourTime, isBrief } = this.props;
    const MessageComponent = isBrief ? MessageBrief : MessageFull;

    return (
      <MessageComponent
        message={message}
        twentyFourHourTime={twentyFourHourTime}
        ownEmail={auth.email}
        onLongPress={this.handleLongPress}
        starred={this.isStarred(message)}
        realm={auth.realm}
        auth={auth}
        actions={actions}
        onLinkPress={actions.messageLinkPress}
      />
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  currentRoute: getCurrentRoute(state),
  flags: getFlags(state),
  twentyFourHourTime: state.realm.twentyFourHourTime,
  subscriptions: getSubscriptions(state),
}))(connectActionSheet(MessageContainer));
