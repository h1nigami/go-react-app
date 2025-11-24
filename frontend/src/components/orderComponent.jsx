import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createOrder, deleteOrder } from "../api/apiOrders";
import "../styles/orders.css"
import { geoCode } from "../api/apiTask";
export default function OrderComponent({ orders, onOrderDelete ,onOrderCreate, tasks }) {
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    description:"",
    addres: {
      from:{
        city:"",
        street:"",
        number:"",
      },
      to:{
        city:"",
        street:"",
        number:"",
      },
     
    },
    coordinates:{
      x_from: null,
      y_from: null,
      x_to:null,
      y_to:null,
    },
      source_id:null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOrder.sourceId || !newOrder.description.trim()) return;
    const coordsFrom = await geoCode(`${newOrder.addres.from.city} ${newOrder.addres.from.street} ${newOrder.addres.from.number}`);
    const coordsTo = await geoCode(`${newOrder.addres.to.city} ${newOrder.addres.to.street} ${newOrder.addres.to.number}`);
    try {
      newOrder.coordinates.x_from = coordsFrom.x;
      newOrder.coordinates.x_to = coordsTo.x;
      newOrder.coordinates.y_from = coordsFrom.y;
      newOrder.coordinates.y_to = coordsTo.y;
      await createOrder(newOrder.sourceId ,newOrder);
      setNewOrder({
        description:"",
    addres: {
      from:{
        city:"",
        street:"",
        number:"",
      },
      to:{
        city:"",
        street:"",
        number:"",
      },
    },
    coordinates:{
      x_from:null,
      x_to:null,
      y_from:null,
      y_to:null,
    }});
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

  const deleteorder = async (id) => {
    await deleteOrder(id);
    onOrderCreate();
  }

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
            <form onSubmit={handleSubmit} 
            style={{
              background:"black",
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",}}>
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
              <h1>От</h1>
              <input type="text"
              value={newOrder.addres.from.city}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres ,from:{...newOrder.addres.from ,city:e.target.value}}})}
              placeholder="Город" />

              <input type="text"
              value={newOrder.addres.from.street}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres, from:{...newOrder.addres.from, street:e.target.value}}})}
              placeholder="Улица" />

              <input type="text"
              value={newOrder.addres.from.number}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres, from:{...newOrder.addres.from, number:e.target.value}}})}
              placeholder="Номер дома" />

              <h1>До</h1>
              <input type="text"
              value={newOrder.addres.to.city}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres, to:{...newOrder.addres.to, city:e.target.value}}})}
              placeholder="Город" />
              <input type="text"
              value={newOrder.addres.to.street}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres, to:{...newOrder.addres.to, street:e.target.value}}})}
              placeholder="Улица" />
              <input type="text"
              value={newOrder.addres.to.number}
              onChange={(e)=>setNewOrder({...newOrder, addres:{...newOrder.addres, to:{...newOrder.addres.to, number:e.target.value}}})}
              placeholder="Номер дома" />
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
              className="contact-info"
              style={{ borderLeftColor: getPriorityColor(order.priority) }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div classzName="order-header-item">
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
              <button className="button" onClick={()=>deleteorder(order.ID)}>Удалить</button>
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