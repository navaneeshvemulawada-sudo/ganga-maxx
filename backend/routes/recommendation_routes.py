from flask import Blueprint, request, jsonify
from backend.services.recommendation_service import RecommendationService
from backend.services.auth_service import token_required

recommend_bp = Blueprint("recommend", __name__, url_prefix="/api/recommend")

@recommend_bp.route("", methods=["POST"])
@token_required
def get_recommendation():
    """
    Generate AI cleaning supply product recommendation.
    """
    data = request.get_json() or {}
    response = RecommendationService.get_recommendations(data)
    return jsonify(response), 200
