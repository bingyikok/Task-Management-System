import type { PageLoad } from './$types';
import axios from 'axios';

export const load: PageLoad = async () => {
	let data: Object = {};
	let app_acronym: string | null = null;

	//access localStorage from client
	if (typeof window !== 'undefined') {
		app_acronym = localStorage.getItem('app_acronym');
	}

	try {
		const [responseSession, responseAppDetails, responseTasks, responsePlans, responsePermits] = await Promise.all([
			axios.get('http://localhost:3000/session', {
				headers: { 'Content-Type': 'application/json' },
				withCredentials: true,
			}),
			app_acronym !== null
				? axios.post(
						'http://localhost:3000/app',
						{ app_acronym },
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					)
				: Promise.resolve({ status: 400, data: {} }),
			app_acronym !== null
				? axios.post(
						'http://localhost:3000/tasks',
						{ app_acronym },
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					)
				: Promise.resolve({ status: 400, data: {} }),
			app_acronym !== null
				? axios.post(
						'http://localhost:3000/plans',
						{ app_acronym },
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					)
				: Promise.resolve({ status: 400, data: {} }),
			app_acronym !== null
				? axios.post(
						'http://localhost:3000/permit',
						{ app_acronym },
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					)
				: Promise.resolve({ status: 400, data: {} }),
		]);
		if (responseSession.status === 200) {
			Object.assign(data, {
				isActive: responseSession.data.isActive,
				isAdmin: responseSession.data.isAdmin,
				username: responseSession.data.username,
                isPM: responseSession.data.isPM,
			});
		}
		if (responseAppDetails.status === 200) {
			Object.assign(data, {
				app: responseAppDetails.data,
			});
		}
		if (responseTasks.status === 200) {
			Object.assign(data, {
				groupedTasks: responseTasks.data,
			});
		}
		if (responsePlans.status === 200) {
			Object.assign(data, {
				plans: responsePlans.data.existingPlans,
				planSelect: responsePlans.data.planNames,
			});
		}
        if (responsePermits.status === 200) {
			Object.assign(data, {
				app_permit_create: responsePermits.data.app_permit_create,
				app_permit_open: responsePermits.data.app_permit_open,
				app_permit_todolist: responsePermits.data.app_permit_todolist,
				app_permit_doing: responsePermits.data.app_permit_doing,
				app_permit_done: responsePermits.data.app_permit_done,
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
