import express from 'express';
import { Response } from 'express';
import { Request } from 'express';
import fetch from 'node-fetch';

const app = express();

app.set('view engine', 'hbs');

interface PostData {
	title: string;
	over_18: boolean;
	created: Number;
	edited: boolean;

	selftext: string;
	description: string;

	author: string;

	score: Number;
	downs: Number;
	ups: Number;
	ups_ratio: Number;

	thumbnail: string;
	url: string;
	permalink: string;

	is_video: boolean;
	extension: string;

	video: Media;
}

interface Media {
	height: Number;
	width: Number;
	fallback_url: string;
}

app.get('/r/:subreddit/comments/:postId*', async (req: Request, res: Response) => {
	const subreddit: string = req.params['subreddit'];
	const postId: string = req.params['postId'];

	if (!subreddit || !postId) return res.sendStatus(400);

	const data = await fetch(`https://reddit.com/r/${subreddit}/comments/${postId}.json`);
	const json: any = await data.json();

	if (!json) return res.sendStatus(400);
	const raw = json[0]?.data?.children[0]?.data;
	const postData = raw as PostData;
	postData.video = raw?.media?.reddit_video as Media;

	if (!postData) return res.sendStatus(400);

	postData.extension = postData.url.slice(postData.url.lastIndexOf('.') + 1);

	if (postData.score > 0) postData.description = `🔺 ${postData.score}\n\n${postData.selftext}`;
	else if (postData.score < 0) postData.description = `🔻 ${postData.score}\n\n${postData.selftext}`;
	else postData.description = `➖ 0\n\n${postData.selftext}`;

	if (postData.is_video) {
		res.render('video', postData);
	} else {
		res.render('image', postData);
	}

});

const port = process.env.PORT || 80;

app.listen(port, () => {
	console.log(`Listening on ${port}`);
});