import { Notify } from "quasar";


export const handleCustomError = (error) => {
    if(!error.response){
        if (error.hasOwnProperty('message')) {
            notify(error.message)
        } else {
            notify('Connection failed, please try again later.')
            // notify('Your account or password is incorrect.')
        }
    } else if (error.response.hasOwnProperty('message')){
        notify(error.response.message);
    } else if (error.response.hasOwnProperty('data')){
        const customErrorApp = customMessageByErrorType(error);
        const status = error.response.status;
        notify(customErrorApp, status)
    } else {
        notify('An unexpected error occurred, please try again later.');
    }
}

export const customNotify = (message , st) => {
    notify(message, st);
}


const notify = (message, error) => {
    Notify.create({
        message: message,
        color: '#595959',
        textColor: 'white',
        classes: 'sora-text',
        icon: iconToast(error) || 'warning',
        actions: [
            {
                // icon: 'close',
                label: "Ok",
                color: 'white',
                style: { backgroundColor: "#595959", padding: "8px", marginRight: "-22px", borderRadius: "5px", fontSize: '10px', fontFamily: 'Sora'},
                handler: () => {}
            }
        ]
    })
}

// const notify = (message, error) => {
//     Notify.create({
//         message: message,
//         color: colorToast(error),
//         textColor: 'white'
//     })
// }

const customMessageByErrorType = (error) => {
    const messages = {
        400: 'Warning! No data available.',
        401: 'Warning! Wrong username or password.',
        404: 'Warning! Usernane of Password Not found.',
        500: 'An unexpected error occurred. please try again later.'
    }
    return messages[error.response.status]
}

const colorToast = (error) => {
    switch (error) {
        case 500:
            return 'warning'
        default:
            return 'negative';
    }
}

const iconToast = (error) => {
    switch (error) {
        case 401:
            return 'warning';
        case 200:
            return 'check_circle';
        case 200:
            return 'primary';
        default:
            return 'warning';
    }
}
