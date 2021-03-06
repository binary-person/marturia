import { authContentTypeHeaders } from './headers'
import { getISOfromDatepicker, getMMDDYYYYfromISO } from '../utils/utils'

export const submitVictimTranslation = (victimTranslationObj, id) => {
	fetch(process.env.REACT_APP_API_BASE + 'victims/' + String(id) + '/victim-translations', {
		method: "POST",
		headers: authContentTypeHeaders(),
		body: JSON.stringify(victimTranslationObj)
	})
	.then(res => res.json())
	.then(data => {
		console.log(data)
	})
	.catch(err => console.log(err))
}

export const handleFileObject = (id, obj, tag, decreaseFun, uploadCounter) => {
	if (obj && obj.length !== 0) {
		for(let i = 0; i < obj.length; i++) {
			uploadMedia(obj[i], id, tag, decreaseFun, uploadCounter)
		}
	}
}

export const uploadProfilePhoto = (obj, id, uploadingPhotoFinishedCallback) => {
	if (!obj || obj.length !== 1) {
		uploadingPhotoFinishedCallback();
		return;
	}
	let formData = new FormData()
	formData.append('myfile', obj[0])
	return fetch(process.env.REACT_APP_API_BASE + 'victims/profile-img/' + String(id), {
		method: "POST",
		body: formData
	})
	.then(res => res.json())
	.then(data => console.log(data))
	.then(() => { 
		uploadingPhotoFinishedCallback();
	})
	.catch(err => console.log(err))
}

export const submitVictimMedia = (url, id, tag) => {
	fetch(process.env.REACT_APP_API_BASE + 'victims/' + String(id) + '/victimmedias', {
		method: "POST",
		headers: authContentTypeHeaders(),
		body: JSON.stringify({date_of_media: "1990-09-22T22:42:31+07:00", mediaurl: url, tag: tag})
	})
	.then(res => res.json())
	.then(data => console.log(data))
	.catch(err => console.log(err))
}

export const submitIncidentMedia = (url, id, tag) => {
	const addedMedia = fetch(process.env.REACT_APP_API_BASE + 'incidents/' + String(id) + '/incident-medias', {
		method: "POST",
		headers: authContentTypeHeaders(),
		body: JSON.stringify({date_of_media: "1990-09-22T22:42:31+07:00", mediaurl: url, tag: tag})
	})
	.then(res => res.json())
	.then(data => data.incident_media)
	.catch(err => { console.log(err); return null; })
	return addedMedia;
}

export const uploadMedia = (file, id, tag, decreaseFun, uploadCounter) => {
	let formData = new FormData()
	formData.append('myfile', file)
	return fetch(process.env.REACT_APP_API_BASE + 'incident-medias/upload', {
		method: "POST",
		body: formData
	})
	.then(res => res.json())
	.then(data => {
		if(data['incident-media-url']) 
		{
			if(tag.indexOf('incident')>-1)
				submitIncidentMedia(data['incident-media-url'], id, tag)
			else
				submitVictimMedia(data['incident-media-url'], id, tag)
		}
	})
	.then(() => decreaseFun(uploadCounter))
	.catch(err => console.log(err))
}

export const submitIncidentTranslation = (translation, id) => {
	fetch(process.env.REACT_APP_API_BASE + 'incidents/' + String(id) + '/victim-translations', {
		method: "POST",
		headers: authContentTypeHeaders(),
		body: JSON.stringify(translation)
	})
	.then(res => res.json())
	.then(data => {
		console.log(data)
	})
	.catch(err => console.log(err))
}

export const submitIncident = (incidentObj, language, id) => {
	incidentObj['date_of_incident'] = getISOfromDatepicker(incidentObj['date_of_incident'])
	incidentObj['location'] = incidentObj['incident_location']
	delete incidentObj['incident_location']
	console.log(incidentObj)
	fetch(process.env.REACT_APP_API_BASE + 'victims/' + String(id) + '/incidents', {
		method: "POST",
		headers: authContentTypeHeaders(),
		body: JSON.stringify(incidentObj)
	})
	.then(res => res.json())
	.then(data => {
		console.log(data)
		let translationObj = {
			'language': language,
			"narrative_of_incident": incidentObj['incident_narrative']
		}
		submitIncidentTranslation(translationObj, data.incident.ID)
	})
	.catch(err => console.log(err))
}

export const submitAllIncidents = (incidentList, incidentData, victimID, language) => {
	incidentList.forEach(index => {
		submitIncident(incidentData[index], language, victimID)
	})
}

export const convertIncidentRestToFormData = (incidentArray) => {
	return incidentArray.map ( incident => {
	let incidentObj = {
		"ID" : incident.ID,
		"date_of_incident" : getMMDDYYYYfromISO(incident.date_of_incident),
		"incident_location" : incident.location
	}
	if(incident.IncidentTranslation && incident.IncidentTranslation.length>0)
	{
		incidentObj.translationID=incident.IncidentTranslation[0].ID
		incidentObj.incident_narrative=incident.IncidentTranslation[0].narrative_of_incident
	}
	return incidentObj
	})
}

export const constructIncidentTranslationObj = (data) => {
	return {
		"language" : data.language === ""? "en": data.language,
		"narrative_of_incident" : data.incident_narrative

	}
}
export const constructIncidentObj = (data,incidentTranslationObj) => {
	let incidentObj =  {
		"date_of_incident" : getISOfromDatepicker(data.date_of_incident),
		"location" : data.incident_location
	}
	if(incidentTranslationObj)
		incidentObj.IncidentTranslation=[incidentTranslationObj]
	return incidentObj
}

export const constructReportObj = (data) => {
	 let victimTranslationObj = {
	  "language": data.language,
	  "gender": data.gender,
	  "nationality": data.country,
	  "health_status": data.health_status,
	  "health_issues": data.health_issues,
	  "profession": data.profession,
	  "languagues_spoken": data.languages_spoken,
	  "about_the_victim": data.about,
	  "additional_information": data.additional
    }

	let reporterInfoObj = constructReportInfoObj(data)

	let incidentTranslationObj = constructIncidentTranslationObj(data)
	let incidentObj = constructIncidentObj(data,incidentTranslationObj)

	let reportObj = constructVictimProfileObj(data, reporterInfoObj, victimTranslationObj, incidentObj)
  return reportObj
}

export const constructReportInfoObj = (data)  => {
	const reporterInfoObj = {
		"name_of_reporter" : data.name,
    "email_of_reporter" : data.email,
    "discovery" : data.discovery,
    "is_direct_testimony": (data.own_testimony === 'yes')
	}
	return reporterInfoObj;
}

export const constructVictimProfileObj = (data, reporterInfoObj, victimTranslationObj, incidentObj)  => {
  let victimProfileObj = {
	  "name": data.victim_name,
	  "legal_name": data.legal_name,
	  "aliases": data.aliases,
	  "place_of_birth" :data.place_of_birth,
		"current_status": data.status,
		"gender": data.gender,
		"country": data.country,
		"date_of_birth": getISOfromDatepicker(data.birth_date),
	  "last_seen_date": getISOfromDatepicker(data.detainment_date),
	  "last_seen_place": data.detainment_location,
		"Report": reporterInfoObj,
	  "VictimTranslation": [victimTranslationObj],
	  "Incident": [incidentObj]
  }
	return victimProfileObj;
}

export const constructSubmitVictimTranslateObjt = (data)  => {
	let victimTranslationObj = {
	  "language": data.language,
	  "health_status": data.health_status,
	  "health_issues": data.health_issues,
	  "profession": data.profession,
	  "languagues_spoken": data.languages_spoken,
	  "about_the_victim": data.about,
	  "additional_information": data.additional
    }
	return victimTranslationObj;
}
