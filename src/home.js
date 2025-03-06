import { useRef,useState, useEffect,useContext, useCallback } from 'react';
import {db} from './firebase';
import {AuthContext} from './AuthContext';
import { ChatContext } from './ChatContext';
import {v4 as uuid} from "uuid"
import { useMediaQuery } from "react-responsive";
import {query,collection,onSnapshot,serverTimestamp, Timestamp, where, getDoc, getDocs, doc, setDoc, updateDoc, arrayUnion} from 'firebase/firestore'
import styled from 'styled-components';

const MessageList = styled.div`
height:${(props) => (props.ismobile  === 'true' ? 'auto' : '85%')};
padding:${(props) => (props.ismobile  === 'true' ? '9px' : '5%')};
`;

const ExistUser = styled.div`
padding:${(props) => (props.ismobile  === 'true' ? '5px' : '15px')};
width:${(props) => (props.ismobile  === 'true' ? '70px' : '100%')};
background:${(props) => (props.selectedchat ? '#d0d0d3' : 'white')};
`;

const SearchUser = styled.div`
padding:${(props) => (props.ismobile  === 'true' ? '5px' : '15px')};
width:${(props) => (props.ismobile  === 'true' ? '70px' : '100%')};
background:${(props) => (props.selectedchat ? '#d0d0d3' : 'white')};
`;

const Usernames = styled.div`
position:${(props) => (props.ismobile  === 'true' ? 'absolute' : 'relative')};
bottom:${(props) => (props.ismobile  === 'true' ? '-65px' : '0')};
flex-direction:${(props) => (props.ismobile  === 'true' ? 'row' : 'column')};
`;

// ChatList Component - Displays a list of chat conversations
const ChatList = ({setSelectedchat,ismobile,selectedchat}) => {
    const [user,setUser] = useState([]);
    const [err,setErr] = useState(false);
    const [username,setUserName] = useState('');
    const {currentUser} = useContext(AuthContext);
    const {dispatch} = useContext(ChatContext);
    const [existUser,setExistUser] = useState([]);
    const [nousershow,setNousershow] = useState('')

    useEffect(() => {
      if (!currentUser) return;

      const q = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let userexist = [];
        querySnapshot.forEach((docs) => {
          const userData = docs.data();
          if (userData.uid !== currentUser.uid) { // ✅ Exclude the current user
            userexist.push(userData);
          }
        });
        setExistUser(userexist);
      });
      return () => unsubscribe();
    },[currentUser]);

    const handleSearch = (e) => {
      e.preventDefault();
      if (!username.trim()) return; 
      
    };

    useEffect(() => {
      if (!username.trim()) return;
      const fetchData = async () => {
        const q = query(
          collection(db, "users"),
          where("name", "==", username.toLowerCase())
        );
    
        try {
          setErr(false);
          const querySnapshot = await getDocs(q);
          const users = [];
          querySnapshot.forEach((doc) => {
            const userdata = doc.data();
            if (userdata.uid !== currentUser.uid) {
              users.push(userdata);
            }
          });
          if (users.length === 0) {
            setErr(true)
            setNousershow("User not found");

            // Hide the message after 3 seconds
            setTimeout(() => {
              setNousershow("");
            }, 3000);
          };
          setUser(users);
        } catch (error) {
          setErr(true);
          setNousershow("User not found");

          // Hide the message after 3 seconds
          setTimeout(() => {
            setNousershow("");
          }, 3000);
        };
        if (username === '') {
          setErr(false)
        };
        console.log('search user : '+ user)
      };
    
      fetchData(); // Call the async function
    
    }, [username]);

    const handlekeydown = (e) => {
      if (e.code === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent form submission
        handleSearch(e);
        setUserName('')
      };
      if (username === '') {
        setErr(false)
      }
    };

    const handleSelect = async (selectedUser) => {
      const combinedId = 
        currentUser.uid > selectedUser.uid
          ? currentUser.uid + selectedUser.uid 
          : selectedUser.uid + currentUser.uid;

      try {
        const res = await getDoc(doc(db,"chats",combinedId));

        if (!res.exists()) {
          await setDoc(doc(db,"chats",combinedId),{messages:[]});

          await updateDoc(doc(db, "users", currentUser.uid), {
            lastChatWith: selectedUser.uid,
            timestamp: serverTimestamp(),
          });

          await updateDoc(doc(db, "users", selectedUser.uid), {
              lastChatWith: currentUser.uid,
              timestamp: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, "users", currentUser.uid), {
            [`chats.${combinedId}.lastChatWith`]: selectedUser.uid,
            [`chats.${combinedId}.timestamp`]: serverTimestamp(),
          });

          await updateDoc(doc(db, "users", selectedUser.uid), {
              [`chats.${combinedId}.lastChatWith`]: currentUser.uid,
            [`chats.${combinedId}.timestamp`]: serverTimestamp(),
          });
        }
      } catch (error) {
        console.log(error)
      };
    };

    const handlechoose = (selectedUser) => {
      if (!selectedUser) return;
    
      dispatch({ type: "CHANGE_USER", payload: selectedUser });
      setSelectedchat(true)
    };

  return (
    <MessageList className="chat-list" ismobile={ismobile}>
      <form className="form uniform" onSubmit={handleSearch}>
          <button type='submit'>
              <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                  <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
          </button>
          <input
            type="text"
            placeholder="Search users..."
            className="search-bar input"
            onKeyDown={handlekeydown}
            value={username}
            onChange={e => setUserName(e.target.value)}
          />
      </form>
      <Usernames className='chatusernames' ismobile={ismobile}>
          {
            err ? (<span className='text-white'>{nousershow}</span>) : (
             <>
               {
                user.length > 0 && user?.map((item,index) => (
                  <SearchUser key={index} selectedchat={selectedchat} ismobile={ismobile} onClick={() => {handleSelect(item);handlechoose(item)}} className='usersearching rounded-md w-full bg-gray-100 py-5 px-5 mb-3 flex justify-center align-middle gap-3'>
                    <img src={item.photoURL} className="avatar w-12 h-12 rounded-full" alt={item.name}/>
                    <div className='chat-title' style={{ display: ismobile  === 'true' ? 'none' : 'block' }}>
                      <span className="chat-name capitalize font-bold">{item.name}</span>
                    </div>
                  </SearchUser>
                ))
              }
             </>
            )
          }
          {
            existUser.length > 0 && existUser.map((item,index) => (
              <ExistUser key={index} selectedchat={selectedchat} ismobile={ismobile} onClick={() => handlechoose(item)} className='usersearching rounded-md w-full  py-5 px-5 mb-3 flex justify-center align-middle gap-3'>
                <img src={item.photoURL} className="avatar w-12 h-12 rounded-full" alt={item.name}/>
                <div className='chat-title' style={{ display: ismobile  === 'true' ? 'none' : 'block' }}>
                  <span className="chat-name capitalize font-bold" >{item.name}</span>
                  <p >{item.timestamp}</p>
                </div>
              </ExistUser>
            ))
          }
          
      </Usernames>
    </MessageList>
  );
};

const style = {
  sent:` justify-start items-start w-full flex-row-reverse `,
  received:` justify-start items-start w-full`,
  senttext:`bg-blue-400`,
  receivedtext:`bg-white`,
  messageall:`flex flex-row items-center gap-3`
}

const Message = styled.div`
`;

const Chatcomponent = styled.div`
padding-top:${(props) => (props.ismobile  === 'true' ? '12%' : '20px')};
height:${(props) => (props.ismobile  === 'true' ? '90%' : '90vh')};
`;

// ChatWindow Component - The main area for viewing and sending messages
const ChatWindow = ({selectedchat,ismobile}) => {
    const [inputMessage,setInputMessage] = useState('');
    const {data} = useContext(ChatContext);
    const [text,setText] = useState([]);
    const {currentUser} = useContext(AuthContext);

    const scrollref = useRef();

    const handleSend =useCallback (async (e) => {
      e.preventDefault();
      if (!currentUser) {
        console.error("No user is logged in");
        return;
      } 
      if (!inputMessage.trim()) return;
      setInputMessage('');

      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        // If chat exists, update it
        await updateDoc(chatRef, {
          messages: arrayUnion({
            id: uuid(),
            text: inputMessage, 
            senderId: currentUser.uid,
            date: Timestamp.now(),
          })
        });
      } else {
        // If chat does NOT exist, create it first
        await setDoc(chatRef, {
          messages: [
            {
              id: uuid(),
              text: inputMessage,
              senderId: currentUser.uid,
              date: serverTimestamp(),
            },
          ],
        });
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        [`chats.${data.chatId}.lastMessage`]: { text: inputMessage, senderId: currentUser.uid },
        [`chats.${data.chatId}.date`]: serverTimestamp(),
      });
      
      await updateDoc(doc(db, "users", data.user.uid), {
        [`chats.${data.chatId}.lastMessage`]: { text: inputMessage, senderId: currentUser.uid },
        [`chats.${data.chatId}.date`]: serverTimestamp(),
      });

      scrollref.current?.scrollIntoView({behavior: 'smooth'});

    }, [inputMessage, currentUser, data.chatId]);

    const handlekeydown = (e) => {
      if (e.code === 'Enter' && !e.shiftKey) {
        handleSend(e);
      }
    }

    useEffect(() => {
      if (!data.chatId) return;
    
      const q = doc(db, "chats", data.chatId);
      const unsubscribe = onSnapshot(q, (docSnap) => {
        if (docSnap.exists()) {
          setText(docSnap.data().messages || []);
        }
      });
      scrollref.current?.scrollIntoView({behavior: 'smooth'});
      return () => unsubscribe(); //  Fix return statement
    }, [data?.chatId]);

    useEffect(() => {
      console.log("ChatWindow re-rendered");
    });

  return (
    <Chatcomponent className="chat-window pb-7 pl-7 pr-7" ismobile={ismobile}>
      {
  selectedchat === true ? (
    <>
      <h2 className='text-white border-solid border-b py-3 capitalize text-3xl'>{data.user.name}</h2>

      <Message className="messages" id="chat-container">
        {
          text?.map((item, index) => (
            <div key={index} className={item.senderId === currentUser.uid ? `${style.sent} ${style.messageall}` : `${style.messageall} ${style.received}`}>
              <img src={item.photoURL} alt={item.name} className='w-10 h-10 border-gray border-solid border rounded-full overflow-hidden object-cover object-center' />
              <div>
                <p className='text-gray-600 text-xs capitalize'>{item.name}</p>
                <p className={`px-4 py-2 rounded-md w-auto ${item.senderId === currentUser.uid ? ` ${style.messageall} ${style.senttext}` : ` ${style.messageall} ${style.receivedtext}`}`}>{item.text}</p>
              </div>
            </div>
          ))
        }
        <span ref={scrollref}></span>
      </Message>

      <div className="message-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={ handlekeydown}
          className='outline-none'
        />
        <button onClick={handleSend}><i className="bi bi-send-fill"></i></button>
      </div>
    </>
  ) : 
    <p className='text-5xl flex w-full h-full justify-center align-middle items-center text-white'>Choose one chat</p>
}

      
    </Chatcomponent>
  );
};

// ChatApp - The main app that holds the chat functionality

const ChatApp= styled.div`
display:${props => (props.ismobile === 'true' ? 'flex' : 'grid')}
`;

const Home = () => {
  const [selectedchat,setSelectedchat] = useState(false);
  const ismobile = useMediaQuery({ maxWidth: 768 });  
 
  return (
    <ChatApp className="chat-app" ismobile={ismobile ? 'true' : 'false'}>
      <ChatList
      setSelectedchat={setSelectedchat}
      selectedchat={selectedchat}
      ismobile={ismobile ? 'true' : 'false'}
      />
      <ChatWindow
      selectedchat={selectedchat}
      ismobile={ismobile ? 'true' : 'false'}
      />
    </ChatApp>
  );
};

export default Home;
