import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';

export const useSocketAuth = ()=>{
    const currentUserId = useSelector((state:RootState)=>state.user.user?.id)
    useEffect(()=>{
       if(currentUserId && socket.connected) {
        socket.emit("userConnected", currentUserId)
       } else if(currentUserId && !socket.connected) {
        socket.connect()
        socket.once("connect",() =>{
            socket.emit("userConnected",currentUserId)
        })
       }
    },[currentUserId])
}
