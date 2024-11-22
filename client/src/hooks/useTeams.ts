import { 
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query';
import { API_URL } from '../constants';

const getTeams = async () => {
    const res = await fetch(API_URL + '/api/getTeams');
    const data = await res.json();
    return data;
}

export default function useTeams() {

    const teamsQuery = useQuery({
        queryKey: [ 'teams' ],
        queryFn: getTeams
    })

    const teams = teamsQuery.data;

    return {
        teams
    }

}