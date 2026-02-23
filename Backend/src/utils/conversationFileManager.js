import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to BiniCommunity folder 
const BINI_COMMUNITY_PATH = path.join(__dirname, '../../BiniCommunity');

//ensure BiniCommunity folder exists
function ensureBiniCommunityFolder() {
  if (!fs.existsSync(BINI_COMMUNITY_PATH)) {
    fs.mkdirSync(BINI_COMMUNITY_PATH, { recursive: true });
    console.log('📁 Created BiniCommunity folder');
  }
}

/**
 * Gets the filename for a conversation between two users
 * Uses sorted user IDs to ensure consistent filename regardless of sender/receiver
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {string} Filename for the conversation
 */
function getConversationFilename(userId1, userId2) {
  // Sort user IDs to ensure consistent filename
  const sortedIds = [userId1, userId2].sort((a, b) => a - b);
  return `${sortedIds[0]}_${sortedIds[1]}.txt`;
}

/**
 * Saves a message to the conversation file
 * @param {number} senderId - ID of the user sending the message
 * @param {number} receiverId - ID of the user receiving the message
 * @param {string} content - Message content
 * @param {string} timestamp - Message timestamp (ISO string)
 * @returns {Promise<void>}
 */
async function saveMessageToFile(senderId, receiverId, content, timestamp) {
  try {
    // Ensure folder exists
    ensureBiniCommunityFolder();

    // Get filename
    const filename = getConversationFilename(senderId, receiverId);
    const filePath = path.join(BINI_COMMUNITY_PATH, filename);

    // Format the message entry
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const messageEntry = `[${formattedDate}] User ${senderId}: ${content}\n`;

    // Check if file exists 
    const fileExists = fs.existsSync(filePath);
    
    // Append message to file 
    fs.appendFileSync(filePath, messageEntry, 'utf8');

    if (!fileExists) {
      console.log(`Created new conversation file: ${filename}`);
    } else {
      console.log(`Appended message to conversation file: ${filename}`);
    }
  } catch (error) {
    console.error('Error saving message to file:', error);
    // Don't throw error to prevent breaking the main flow
  }
}

/**
 * Gets all messages from a conversation file
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {Promise<string>} Conversation content or empty string
 */
async function getConversationFromFile(userId1, userId2) {
  try {
    const filename = getConversationFilename(userId1, userId2);
    const filePath = path.join(BINI_COMMUNITY_PATH, filename);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return '';
  } catch (error) {
    console.error('Error reading conversation file:', error);
    return '';
  }
}

/**
 * Exports all conversations from database to text files
 * Groups messages by conversation pairs and saves them to files
 * @param {Array} messages - Array of message objects from database
 * @returns {Promise<Object>} Summary of export operation
 */
async function exportAllConversations(messages) {
  try {
    ensureBiniCommunityFolder();

    // Group messages by conversation pair
    const conversations = new Map();

    messages.forEach((message) => {
      const { sender_id, receiver_id, content, created_at } = message;
      const filename = getConversationFilename(sender_id, receiver_id);

      if (!conversations.has(filename)) {
        conversations.set(filename, []);
      }

      conversations.get(filename).push({
        sender_id,
        receiver_id,
        content,
        created_at
      });
    });

    // Sort messages within each conversation by timestamp
    conversations.forEach((msgs, filename) => {
      msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    // Write each conversation to file
    let filesCreated = 0;
    let filesUpdated = 0;
    let totalMessages = 0;

    for (const [filename, msgs] of conversations.entries()) {
      const filePath = path.join(BINI_COMMUNITY_PATH, filename);
      const fileExists = fs.existsSync(filePath);

      // Build file content
      let fileContent = '';
      msgs.forEach((msg) => {
        const date = new Date(msg.created_at);
        const formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        fileContent += `[${formattedDate}] User ${msg.sender_id}: ${msg.content}\n`;
        totalMessages++;
      });

      // Write to file 
      fs.writeFileSync(filePath, fileContent, 'utf8');

      if (fileExists) {
        filesUpdated++;
      } else {
        filesCreated++;
      }
    }

    return {
      success: true,
      filesCreated,
      filesUpdated,
      totalConversations: conversations.size,
      totalMessages
    };
  } catch (error) {
    console.error('❌ Error exporting conversations:', error);
    throw error;
  }
}

export {
  saveMessageToFile,
  getConversationFromFile,
  ensureBiniCommunityFolder,
  exportAllConversations
};

