const ConversationParticipant = require("../models/conversationParticipant");
export const isParticipant = (conversationId: string, userId: string) => {
  const participants = ConversationParticipant.find({
    conversationId: conversationId,
  });
  for (let i = 0; i < participants.length; i++) {
    const participantArr = [participants[i].userId];

    if (participantArr.includes(userId)) return true;
    else return false;
  }
};
const makeArrayOfId = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    return new Array(arr[i].userId);
  }
};

// If no visible messages for user in conversation show no conversation in convo list and show skeleton

/*
conversation must be visible(
  at least 1 message visible for user,
  conversation itself visible for user,
  conversation must have messages array to be visible
  )


*/
type Conversation = {
  participants: string[];
  messages: string[];
  visibleFor: string[];
};
type Message = {
  conversation: string;
  senderId: string;
  body: string;
  media: string[];
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  visibleFor: string[];
};
const conversationVisible = (
  conversation: Conversation,
  messages: Message[],
  userId: string
) => {
  let visibleMessagesArr: any = [];
  for (let message of messages) {
    if (message.visibleFor.includes(userId)) visibleMessagesArr.push(message);
    return visibleMessagesArr;
  }
  if (
    conversation.visibleFor.includes(userId) === true &&
    conversation.messages.length !== 0 &&
    visibleMessagesArr.length !== 0
  )
    return true;
};
