import HistoryModel from "@/models/history.model";
import { bookHistoryReqHandler } from "@/types";
import { RequestHandler } from "express";

type highlight = { fill: string, selection: string }


export const updateBookHistory: RequestHandler = async (
    req,
    res
) => {
    const { bookId, highlights = [], lastLocation, removeHighlight } = req.body;

    let history = await HistoryModel.findOne({
        bookId,
        userId: req.user.id,
    });

    if (!history) {
        history = new HistoryModel({
            userId: req.user.id,
            bookId,
            lastLocation,
            highlights: highlights.map((highlight: { fill: string, selection: string }) => ({
                fill: highlight.fill ?? "",
                selection: highlight.selection ?? "",
            })),
        });
    } else {
        if (lastLocation) history.lastLocationBook = lastLocation;
        // storing highlights
        if (highlights.length && !removeHighlight) {
            history.highlights.push(
                ...highlights.map((highlight: highlight) => ({
                    fill: highlight.fill ?? "",
                    selection: highlight.selection ?? "",
                }))
            );
        }
        // removing highlights
        if (highlights.length && removeHighlight) {
            history.highlights = history.highlights.filter((h) => {
                const highlight = highlights.find((item: highlight) => {
                    if (item.selection === h.selection) {
                        return item
                    }
                });
                if (!highlight) return true;
            });
        }
    }

    await history.save();
    res.send();
};