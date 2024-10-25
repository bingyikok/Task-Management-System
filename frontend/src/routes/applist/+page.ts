import type { PageLoad } from './$types';
import axios from 'axios';

export const load: PageLoad = async () => {
	let data: Object = {};

	try {
		const [responseSession, responseApps, responseGroups] = await Promise.all([
			axios.get('http://localhost:3000/session', {
				headers: { 'Content-Type': 'application/json' },
				withCredentials: true,
			}),
			axios.get('http://localhost:3000/apps', {
				headers: { 'Content-Type': 'application/json' },
				withCredentials: true,
			}),
			axios.get('http://localhost:3000/groups', {
				headers: { 'Content-Type': 'application/json' },
				withCredentials: true,
			}),
		]);
		if (responseSession.status === 200) {
			Object.assign(data, {
				isActive: responseSession.data.isActive,
				isAdmin: responseSession.data.isAdmin,
                isPL: responseSession.data.isPL,
			});
		}
		if (responseApps.status === 200) {
			Object.assign(data, {
				apps: responseApps.data,
			});
		}
		if (responseGroups.status === 200) {
			Object.assign(data, {
				groupname: responseGroups.data,
			});
		}
		return data;
	} catch (error: any) {
		return {
			error: error.response.data,
            status: error.response.status,
		};
	}
};
