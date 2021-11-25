'use strict'

const embedMessage = {
    color: String,
    title: String,
    url: String,
    author: {
		name: 'Destiny 2',
		icon_url: "https://img.icons8.com/color/144/000000/destiny-2.png",
        url: 'https://www.bungie.net/es',
	},
    thumbnail: {
        url: String,
    },
    fields: [],
    image: {
        url: String,
    },
    description: String,
    footer: {
        text: String,
    }
}

export default embedMessage;
