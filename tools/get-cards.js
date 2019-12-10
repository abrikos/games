import functions from "./parser.inc";
const fs = require('fs');


const link = `https://commons.wikimedia.org/wiki/Category:SVG_playing_cards`;
const fileImages = `download-images.sh`;
try {
    fs.unlinkSync(fileImages);
} catch (e) {

}


async function main() {
    const fdImg = fs.openSync(fileImages, 'w');
    const doc = await functions.getDom(link);
    const root = doc.querySelector('.mw-gallery-traditional');
    const links = root.querySelectorAll('a.image');
    for(const link of links){
        const pageLink = 'https://commons.wikimedia.org' + link.attributes.href;
        const pageDoc = await functions.getDom(pageLink);
        const a = pageDoc.querySelector('a.internal');
        console.log(a.attributes.href)
        fs.writeSync(fdImg, `wget -nc -O "client/views/blackjack/cards/${a.attributes.title}" "${a.attributes.href}"\n`, null, null);
    }
    fs.closeSync(fdImg);
}


main();
