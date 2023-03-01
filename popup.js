window.addEventListener("load", () => {
    document.getElementById('popupTitle').innerText = chrome.i18n.getMessage("popupTitle");
    const radios = document.querySelectorAll('input[type=radio]');

    function changeHandler(event) {
        chrome.storage.local.set({'platformChoice': event.target.value});
    }

    Array.prototype.forEach.call(radios, function(radio) {
        radio.addEventListener('change', changeHandler);
    });

    // Load the saved platform choice, if any
    chrome.storage.local.get('platformChoice', function(storage) {
        switch(storage.platformChoice) {
            case 'deezer':
            case undefined:
                document.getElementById('deezer').checked = true;
                break;
            case 'youtube-music':
                document.getElementById('youtube-music').checked = true;
                break;
            case 'amazon-music':
                document.getElementById('amazon-music').checked = true;
                break;
            case 'spotify':
                document.getElementById('spotify').checked = true;
                break;
            default:
                document.getElementById('deezer').checked = true;
                chrome.storage.local.set({'platformChoice': 'deezer'});
                break;
        }
    });
});
