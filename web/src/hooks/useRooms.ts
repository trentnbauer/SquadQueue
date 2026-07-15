import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/rooms';
import { useView } from '../context/ViewContext';
import type { CreateRoomRequest, JoinRoomRequest } from '@squadqueue/shared';

export function useRooms() {
  const { setRooms } = useView();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.list });

  useEffect(() => {
    if (query.data) setRooms(query.data.rooms);
  }, [query.data, setRooms]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rooms'] });

  const createRoom = useMutation({
    mutationFn: (body: CreateRoomRequest) => roomsApi.create(body),
    onSuccess: invalidate,
  });

  const joinRoom = useMutation({
    mutationFn: (body: JoinRoomRequest) => roomsApi.join(body),
    onSuccess: invalidate,
  });

  return {
    rooms: query.data?.rooms ?? [],
    isLoading: query.isLoading,
    createRoom,
    joinRoom,
  };
}
