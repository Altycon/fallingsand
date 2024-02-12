

export const AltyWorker = {

    hasServiceWorker: function(){

        return ('serviceWorker' in navigator);

    },
    register: function(){

        if(AltyWorker.hasServiceWorker()){

            navigator.serviceWorker.register('/sw.js', {

                scope: '/'
    
            })
            .then( (registration) => {
    
                //APP.serviceWorker = registration.installing || registration.waiting || registration.active;
    
                console.log('service worker registered');
    
            })
            .catch( (error)=> {
    
                console.log(`Failed to register`, error.message);
    
            });

        }else{

            console.log('Serive worker not supported');

            alert('Serive worker not supported in your browser');
        }

    }
};


export function unRegisterAllRegisteredServiceWorkers(){

    //something that you can do but won't need to unless special need
    navigator.serviceWorker.getRegistrations().then( registrations => {

        for(let registration of registrations){

            registration.unregister().then( isUnregistered => console.log( isUnregistered ));

        }
    });

}