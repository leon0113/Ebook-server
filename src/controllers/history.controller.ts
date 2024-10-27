import HistoryModel from "@/models/history.model";
import { bookHistoryReqHandler } from "@/types";
import { RequestHandler } from "express";

export const updateBookHistory: RequestHandler<{}, {}, bookHistoryReqHandler> = async (
    req,
    res
) => {
    const { bookId, highlights = [], lastLocation } = req.body;

    let history = await HistoryModel.findOne({
        bookId,
        userId: req.user.id,
    });

    if (!history) {
        history = new HistoryModel({
            userId: req.user.id,
            bookId,
            lastLocation,
            highlights: highlights.map((highlight) => ({
                fill: highlight.fill ?? "",
                selection: highlight.selection ?? "",
            })),
        });
    } else {
        if (lastLocation) history.lastLocationBook = lastLocation;
        if (highlights.length) {
            history.highlights.push(
                ...highlights.map((highlight) => ({
                    fill: highlight.fill ?? "",
                    selection: highlight.selection ?? "",
                }))
            );
        }
    }

    await history.save();
    res.send();
};