import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createOrder } from "../api/apiOrders";
import "../styles/orders.css"
export default function OrderComponent({ orders, onOrderCreate, tasks }) {
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    sourceId: "",
    description: "",
    priority: "medium",
    address: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOrder.sourceId || !newOrder.description.trim()) return;
    
    try {
      await createOrder(newOrder);
      setNewOrder({
        sourceId: "",
        description: "",
        priority: "medium",
        address: ""
      });
      setShowForm(false);
      onOrderCreate();
    } catch (error) {
      console.error("Ошибка создания заявки:", error);
    }
  };

  const getSourceName = (sourceId) => {
    const source = tasks.find(task => task.ID === parseInt(sourceId));
    return source ? source.title : "Неизвестный источник";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#f44336";
      case "medium": return "#ff9800";
      case "low": return "#4caf50";
      default: return "#9e9e9e";
    }
  };

  return (
    <div className="todo-card-result">
      <div className="order-header">
        <h2>Заявки по источникам</h2>
        <button 
          className="button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отменить" : "Создать заявку"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="order-form"
          >
            <form onSubmit={handleSubmit}>
              <select
                value={newOrder.sourceId}
                onChange={(e) => setNewOrder({...newOrder, sourceId: e.target.value})}
                required
              >
                <option value="">Выберите источник</option>
                {tasks.map(task => (
                  <option key={task.ID} value={task.ID}>
                    {task.title}
                  </option>
                ))}
              </select>
              
              <textarea
                value={newOrder.description}
                onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                placeholder="Описание заявки"
                required
                rows="3"
              />
              
              <select
                value={newOrder.priority}
                onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              
              <input
                type="text"
                value={newOrder.address}
                onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                placeholder="Адрес (необязательно)"
              />
              
              <button type="submit" className="button">
                Создать заявку
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="orders-list">
        <h3>Список заявок ({orders.length})</h3>
        <AnimatePresence>
          {orders.map((order) => (
            <motion.div
              key={order.id || order.ID}
              className="order-item"
              style={{ borderLeftColor: getPriorityColor(order.priority) }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="order-header-item">
                <h4>{getSourceName(order.source_id || order.sourceId)}</h4>
                <span 
                  className="order-priority"
                  style={{ backgroundColor: getPriorityColor(order.priority) }}
                >
                  {order.priority === "high" ? "Высокий" : 
                   order.priority === "medium" ? "Средний" : "Низкий"}
                </span>
              </div>
              <p className="order-description">{order.description}</p>
              {order.address && (
                <p className="order-address">📍 {order.address}</p>
              )}
              <div className="order-meta">
                <span className="order-date">
                  {new Date(order.created_at || Date.now()).toLocaleString('ru-RU')}
                </span>
                <span className="order-status">
                  {order.status || "Создана"}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {orders.length === 0 && (
          <div className="no-orders">
            <p>Заявок пока нет. Создайте первую заявку!</p>
          </div>
        )}
      </div>
    </div>
  );
}