import HistoryModel from "@/models/history.model";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

type highlightType = { fill: string, selection: string }


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
                ...highlights.map((highlight: highlightType) => ({
                    fill: highlight.fill ?? "",
                    selection: highlight.selection ?? "",
                }))
            );
        }
        // removing highlights
        if (highlights.length && removeHighlight) {
            history.highlights = history.highlights.filter((h) => {
                const highlight = highlights.find((item: highlightType) => {
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


export const getBookHistory: RequestHandler = async (req, res) => {
    const { bookId } = req.params;

    if (!isValidObjectId(bookId)) {
        return sendErrorResponse({
            res,
            status: 422,
            message: 'Invalid book id',
        })
    };

    const history = await HistoryModel.findOne({ userId: req.user.id, bookId });
    if (!history) {
        return sendErrorResponse({
            res,
            status: 404,
            message: 'no history found',
        })
    }

    const formatHistory = {
        lastLocation: history.lastLocationBook,
        highlights: history.highlights.map((highlight: highlightType) => {
            return {
                fill: highlight.fill,
                selection: highlight.selection,
            }
        })
    };

    res.json({ formatHistory })
}